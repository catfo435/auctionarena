-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (merged with artists)
CREATE TABLE IF NOT EXISTS users (
    uid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    artist_role VARCHAR(20) CHECK (artist_role IN ('none', 'artist', 'both')) DEFAULT 'none' -- Indicates if the user is an artist, a regular user, or both
);

-- Artworks table
CREATE TABLE IF NOT EXISTS artworks (
    artwork_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES users(uid), -- Users are now artists
    title VARCHAR(255) NOT NULL,
    image_url TEXT,
    start_price DECIMAL(10, 2) NOT NULL
);

-- Auctions table
CREATE TABLE IF NOT EXISTS auctions (
    auction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    s_time TIMESTAMP NOT NULL,
    e_time TIMESTAMP NOT NULL,
    s_price DECIMAL(10, 2) NOT NULL,
    e_price DECIMAL(10, 2),
    artwork_id UUID NOT NULL REFERENCES artworks(artwork_id),
    status VARCHAR(20) DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'ended')) -- Status to track auction state
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    uid UUID REFERENCES users(uid),
    rating INT NOT NULL,
    date DATE NOT NULL,
    artwork_id UUID REFERENCES artworks(artwork_id),
    PRIMARY KEY (uid, date, artwork_id)
);

-- Bids table to track user bids
CREATE TABLE IF NOT EXISTS bids (
    bid_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID NOT NULL REFERENCES auctions(auction_id),
    bidder_uid UUID NOT NULL REFERENCES users(uid),
    bid_price DECIMAL(10, 2) NOT NULL,
    bid_time TIMESTAMP NOT NULL
);

-- Auction Results table for storing auction outcomes
CREATE TABLE IF NOT EXISTS auction_results (
    auction_id UUID PRIMARY KEY REFERENCES auctions(auction_id),
    winner_uid UUID NOT NULL REFERENCES users(uid),
    final_price DECIMAL(10, 2) NOT NULL,
    end_time TIMESTAMP NOT NULL
);

-- Auction History table for tracking user participation in auctions
CREATE TABLE IF NOT EXISTS auction_history (
    history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid UUID NOT NULL REFERENCES users(uid),
    auction_id UUID NOT NULL REFERENCES auctions(auction_id)
);

-- Insert Admin User
INSERT INTO users (uid, name, email)
VALUES (uuid_generate_v4(), 'Admin', 'admin@auction.arena.dbms.com');

-- Trigger Function: Validate Start Price
CREATE OR REPLACE FUNCTION validate_start_price_fn()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.s_price < (SELECT start_price FROM artworks WHERE artwork_id = NEW.artwork_id) THEN
        RAISE EXCEPTION 'Auction start_price (%s) must be greater than or equal to the artwork start_price.', NEW.s_price;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Validate Start Price
CREATE TRIGGER validate_start_price
BEFORE INSERT ON auctions
FOR EACH ROW
EXECUTE FUNCTION validate_start_price_fn();

-- Trigger Function: Initial Bid Insertion
CREATE OR REPLACE FUNCTION after_auction_insert_fn()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert an initial bid for the auction
    INSERT INTO bids (bid_id, auction_id, bidder_uid, bid_price, bid_time)
    VALUES (
        uuid_generate_v4(),  -- Generate a new UUID for the bid_id
        NEW.auction_id,      -- Use the auction_id of the new auction
        (SELECT uid FROM users WHERE email = 'admin@auction.arena.dbms.com'), -- Admin's user_id
        NEW.s_price,         -- Use the start_price of the auction
        NOW()                -- Current timestamp
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Initial Bid Insertion
CREATE TRIGGER after_auction_insert
AFTER INSERT ON auctions
FOR EACH ROW
EXECUTE FUNCTION after_auction_insert_fn();

-- Trigger Function: Update Artwork Start Price
CREATE OR REPLACE FUNCTION update_artwork_and_auction_end_price_func()
RETURNS TRIGGER AS $$
DECLARE
    highest_bid DECIMAL(10, 2);
BEGIN
    -- Get the highest bid for the auction
    SELECT MAX(bid_price)
    INTO highest_bid
    FROM bids
    WHERE auction_id = NEW.auction_id;

    -- Update the artwork's start_price with the highest bid
    UPDATE artworks
    SET start_price = highest_bid
    WHERE artwork_id = NEW.artwork_id;

    -- Update the auction's end_price with the highest bid
    UPDATE auctions
    SET e_price = highest_bid
    WHERE auction_id = NEW.auction_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update Artwork Start Price
CREATE OR REPLACE TRIGGER update_artwork_and_auction_end_price
AFTER UPDATE ON auctions
FOR EACH ROW
WHEN (OLD.status = 'ongoing' AND NEW.status = 'ended') -- Trigger only when status changes to 'ended'
EXECUTE FUNCTION update_artwork_and_auction_end_price_func();

CREATE OR REPLACE FUNCTION add_to_auction_history_func()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the bidder is not the admin
    IF NEW.bidder_uid != (SELECT uid FROM users WHERE email = 'admin@auction.arena.dbms.com') THEN
        -- Insert into auction_history only if there's no existing entry for this user and auction
        IF NOT EXISTS (
            SELECT 1
            FROM auction_history
            WHERE auction_id = NEW.auction_id
              AND uid = NEW.bidder_uid
        ) THEN
            INSERT INTO auction_history (history_id, uid, auction_id)
            VALUES (uuid_generate_v4(), NEW.bidder_uid, NEW.auction_id);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_to_auction_history
AFTER INSERT ON bids
FOR EACH ROW
EXECUTE FUNCTION add_to_auction_history_func();

CREATE OR REPLACE FUNCTION set_auction_winner_func()
RETURNS TRIGGER AS $$
DECLARE
    highest_bid DECIMAL(10, 2);
    winner_uid UUID;
    admin_uid UUID;
BEGIN
    -- Get the admin's user ID
    SELECT uid INTO admin_uid
    FROM users
    WHERE email = 'admin@auction.arena.dbms.com';

    -- Find the highest bid and the corresponding user, ensuring the user is not the admin
    SELECT bid_price, bidder_uid
    INTO highest_bid, winner_uid
    FROM bids
    WHERE auction_id = NEW.auction_id
      AND bidder_uid != admin_uid
    ORDER BY bid_price DESC
    LIMIT 1;

    -- If a valid highest bid exists, insert into auction_results
    IF highest_bid IS NOT NULL THEN
        INSERT INTO auction_results (auction_id, winner_uid, final_price, end_time)
        VALUES (NEW.auction_id, winner_uid, highest_bid, NOW());
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_auction_winner
AFTER UPDATE ON auctions
FOR EACH ROW
WHEN (OLD.status = 'ongoing' AND NEW.status = 'ended') -- Trigger only when the auction ends
EXECUTE FUNCTION set_auction_winner_func();

CREATE OR REPLACE FUNCTION validate_bid_price_func()
RETURNS TRIGGER AS $$
DECLARE
    latest_bid_price DECIMAL(10, 2);
BEGIN
    -- Fetch the latest bid price for the auction
    SELECT MAX(bid_price)
    INTO latest_bid_price
    FROM bids
    WHERE auction_id = NEW.auction_id;

    -- Ensure the new bid is greater than the latest bid
    IF latest_bid_price IS NOT NULL AND NEW.bid_price <= latest_bid_price THEN
        RAISE EXCEPTION 'New bid (%s) must be greater than the latest bid (%s) for this auction.',
            NEW.bid_price, latest_bid_price;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_bid_price
BEFORE INSERT ON bids
FOR EACH ROW
EXECUTE FUNCTION validate_bid_price_func();

-- Step 1: Create the function to check auction status before inserting a bid
CREATE OR REPLACE FUNCTION check_auction_status_before_bid()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the associated auction has ended
    IF EXISTS (
        SELECT 1
        FROM auctions
        WHERE auction_id = NEW.auction_id
        AND status = 'ended'
    ) THEN
        -- Raise an exception if the auction is ended
        RAISE EXCEPTION 'Cannot place a bid on an auction that has ended.';
    END IF;

    -- If auction is not ended, allow the insert
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create the trigger to call the function before inserting a bid
CREATE TRIGGER prevent_bid_on_ended_auction
BEFORE INSERT ON bids
FOR EACH ROW
EXECUTE FUNCTION check_auction_status_before_bid();


