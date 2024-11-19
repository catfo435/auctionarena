# Database Documentation for Arena Art Auction Portal

## Overview
Arena uses a PostgreSQL database to manage users, artworks, auctions, bids, and related entities. The schema is designed to facilitate the operation of an online art auction system, supporting features like user roles (artists and regular users), auction creation, bid placement, and auction result tracking.

## Tables

### 1. Users Table

- **Description**: This table stores user details. It includes both regular users and artists, with a role indicator (`artist_role`).
  
- **Columns**:
  - `uid`: Unique identifier for each user (UUID, Primary Key).
  - `name`: User's full name.
  - `email`: Unique email address for the user (used for login).
  - `artist_role`: Indicates whether the user is a regular user, an artist, or both. It is set to 'none' by default.
  
- **Constraints**:
  - The `email` column must be unique.

### 2. Artworks Table

- **Description**: This table stores details of artwork listed in the auction.
  
- **Columns**:
  - `artwork_id`: Unique identifier for each artwork (UUID, Primary Key).
  - `artist_id`: The `uid` of the artist who owns the artwork (Foreign Key referencing `users.uid`).
  - `title`: Title of the artwork.
  - `image_url`: URL to an image of the artwork.
  - `start_price`: The starting price of the artwork for the auction.
  
- **Constraints**:
  - `artist_id` must reference a valid user.

### 3. Auctions Table

- **Description**: This table stores auction details, including start and end times, prices, and auction status.
  
- **Columns**:
  - `auction_id`: Unique identifier for each auction (UUID, Primary Key).
  - `s_time`: Start time of the auction.
  - `e_time`: End time of the auction.
  - `s_price`: Starting price for the auction.
  - `e_price`: Final price of the auction (nullable).
  - `artwork_id`: The `artwork_id` of the artwork being auctioned (Foreign Key referencing `artworks.artwork_id`).
  - `status`: Current status of the auction (one of 'future', 'ongoing', 'ended').

- **Constraints**:
  - `artwork_id` must reference a valid artwork.

### 4. Bids Table

- **Description**: This table tracks all bids placed during an auction.

- **Columns**:
  - `bid_id`: Unique identifier for each bid (UUID, Primary Key).
  - `auction_id`: The `auction_id` for which the bid is placed (Foreign Key referencing `auctions.auction_id`).
  - `bidder_uid`: The `uid` of the user placing the bid (Foreign Key referencing `users.uid`).
  - `bid_price`: The amount of money the user bids.
  - `bid_time`: The timestamp when the bid was placed.

### 5. Auction Results Table

- **Description**: This table stores the outcome of each auction, including the winner and final price.

- **Columns**:
  - `auction_id`: The `auction_id` of the completed auction (Foreign Key referencing `auctions.auction_id`).
  - `winner_uid`: The `uid` of the user who won the auction (Foreign Key referencing `users.uid`).
  - `final_price`: The final price at which the artwork was sold.
  - `end_time`: The time when the auction ended.

### 6. Auction History Table

- **Description**: Tracks which users have participated in which auctions.

- **Columns**:
  - `history_id`: Unique identifier for each history entry (UUID, Primary Key).
  - `uid`: The `uid` of the user who participated (Foreign Key referencing `users.uid`).
  - `auction_id`: The `auction_id` the user participated in (Foreign Key referencing `auctions.auction_id`).

### 7. Reviews Table

- **Description**: Stores user ratings and reviews for artworks.

- **Columns**:
  - `uid`: The `uid` of the user leaving the review (Foreign Key referencing `users.uid`).
  - `rating`: A rating from 1 to 5 for the artwork.
  - `date`: The date when the review was posted.
  - `artwork_id`: The `artwork_id` being reviewed (Foreign Key referencing `artworks.artwork_id`).

- **Constraints**:
  - Primary key is a composite of `uid`, `date`, and `artwork_id`.

## Triggers and Functions

The following triggers and functions automate key behaviors within the database:

### 1. `check_end_time_and_set_status()`

- **Purpose**: This function checks the `end_time` of an auction before insertion, ensuring it’s in the future and sets the status (`future`, `ongoing`).

### 2. `validate_start_price_fn()`

- **Purpose**: Ensures the `start_price` of an auction is greater than or equal to the `start_price` of the associated artwork.

### 3. `after_auction_insert_fn()`

- **Purpose**: Inserts an initial bid for an auction when it is created, using the admin's account and the auction’s `start_price`.

### 4. `update_artwork_and_auction_end_price_func()`

- **Purpose**: Updates the artwork’s `start_price` and auction’s `end_price` with the highest bid when the auction ends.

### 5. `add_to_auction_history_func()`

- **Purpose**: Adds a user to the `auction_history` when they place a bid, unless the bidder is the admin.

### 6. `set_auction_winner_func()`

- **Purpose**: Sets the winner of the auction by selecting the highest bid from users (excluding the admin) and stores the result in `auction_results`.

### 7. `validate_bid_price_func()`

- **Purpose**: Ensures that each new bid is greater than the previous highest bid.

### 8. `check_auction_status_before_bid()`

- **Purpose**: Prevents bidding on auctions that have already ended or have not started.

### 9. `update_artist_role_on_bid()`

- **Purpose**: Updates a user’s `artist_role` to `both` if they bid on an artwork, indicating that they are both a bidder and an artist.

### 10. `update_artist_role_on_artwork_upload()`

- **Purpose**: Sets the `artist_role` to `both` for a user when they upload artwork.