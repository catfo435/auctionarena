CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    uid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    auction_id UUID
);

CREATE TABLE IF NOT EXISTS artworks (
    artwork_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id INT,
    title VARCHAR(255) NOT NULL,
    image_url TEXT,
    start_price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS auctions (
    auction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    s_time TIMESTAMP NOT NULL,
    e_time TIMESTAMP NOT NULL,
    s_price DECIMAL(10, 2) NOT NULL,
    e_price DECIMAL(10, 2),
    artwork_id UUID
);

CREATE TABLE IF NOT EXISTS reviews (
    uid UUID REFERENCES users(uid),
    rating INT NOT NULL,
    date DATE NOT NULL,
    artwork_id UUID REFERENCES artworks(artwork_id),
    PRIMARY KEY (uid, date, artwork_id)
);

CREATE OR REPLACE FUNCTION generate_uuid_users()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.uid IS NULL THEN
        NEW.uid := uuid_generate_v4();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_uuid_artworks()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.artwork_id IS NULL THEN
        NEW.artwork_id := uuid_generate_v4();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_uuid_auctions()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.auction_id IS NULL THEN
        NEW.auction_id := uuid_generate_v4();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_uuid_before_insert_users
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION generate_uuid_users();

CREATE TRIGGER set_uuid_before_insert_artworks
BEFORE INSERT ON artworks
FOR EACH ROW
EXECUTE FUNCTION generate_uuid_artworks();

CREATE TRIGGER set_uuid_before_insert_auctions
BEFORE INSERT ON auctions
FOR EACH ROW
EXECUTE FUNCTION generate_uuid_auctions();

ALTER TABLE auctions
    ADD CONSTRAINT fk_artwork_id FOREIGN KEY (artwork_id) REFERENCES artworks(artwork_id);

ALTER TABLE users
    ADD CONSTRAINT fk_auction_id FOREIGN KEY (auction_id) REFERENCES auctions(auction_id);