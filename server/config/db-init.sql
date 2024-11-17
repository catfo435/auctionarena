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