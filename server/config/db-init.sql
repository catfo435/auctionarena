CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    uid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    auction_id UUID
);

CREATE TABLE IF NOT EXISTS artists (
    artist_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS artworks (
    artwork_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES artists(artist_id),
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
    artwork_id UUID NOT NULL REFERENCES artworks(artwork_id)
);

CREATE TABLE IF NOT EXISTS reviews (
    uid UUID REFERENCES users(uid),
    rating INT NOT NULL,
    date DATE NOT NULL,
    artwork_id UUID REFERENCES artworks(artwork_id),
    PRIMARY KEY (uid, date, artwork_id)
);