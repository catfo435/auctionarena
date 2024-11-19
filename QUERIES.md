# API QUERY Documentation for Arena Art Auction Portal

## User Queries

```sql
SELECT name, email FROM users WHERE uid=$1;
```
- This query fetches the basic information (name and email) of a user based on their `uid`.
---

### 1. **User Statistics Query (When 'all' Query Param is True)**

```sql
SELECT
    (SELECT COUNT(*) FROM bids WHERE bidder_uid = $1) AS bids_placed,
    (SELECT COUNT(*) FROM auction_history WHERE uid = $1) AS total_auctions,
    (SELECT COUNT(*) FROM auction_results WHERE winner_uid = $1) AS auctions_won,
    (SELECT COUNT(DISTINCT a.auction_id)
     FROM bids b
     JOIN auctions a ON b.auction_id = a.auction_id
     WHERE b.bidder_uid = $1 AND a.status='ongoing'
     AND b.bid_price = (SELECT MAX(bid_price) FROM bids WHERE auction_id = b.auction_id)) AS auctions_leading
```
This query provides the statistics of a user, including:
- The number of bids placed by the user.
- The total number of auctions the user has participated in.
- The number of auctions the user has won.
- The number of ongoing auctions where the user is currently in the lead.

---

### 2. **Dashboard Data Query**


```sql
SELECT 
    (SELECT COUNT(a.auction_id)
     FROM auctions a
     JOIN auction_history ah ON a.auction_id = ah.auction_id
     JOIN users u ON ah.uid = u.uid
     WHERE u.uid = $1 AND a.status = 'ongoing') AS active_auctions,
    
    (SELECT COUNT(*) 
     FROM auction_results 
     WHERE winner_uid = $1) AS auctions_won,
    
    (SELECT COUNT(DISTINCT b.auction_id)
     FROM bids b
     JOIN auctions a ON b.auction_id = a.auction_id
     WHERE a.status = 'ongoing' 
     AND b.bidder_uid = $1
     AND b.bid_price = (SELECT MAX(bid_price) 
                        FROM bids 
                        WHERE auction_id = b.auction_id)) AS auctions_in_lead
```
This query fetches dashboard data for a user, including:
- The number of active (ongoing) auctions the user is participating in.
- The number of auctions the user has won.
- The number of ongoing auctions where the user is in - the lead.
---

### 3. **Auctions List Query (For User Auctions)**
```sql
SELECT 
    aw.title AS artwork_title,
    a.s_price AS start_price,
    MAX(b.bid_price) AS current_price,
    a.e_time AS end_time
FROM auctions a
JOIN auction_history ah ON a.auction_id = ah.auction_id
JOIN users u ON ah.uid = u.uid
JOIN artworks aw ON a.artwork_id = aw.artwork_id
LEFT JOIN bids b ON a.auction_id = b.auction_id
WHERE u.uid = $1
AND a.status = 'ongoing'
GROUP BY a.auction_id, aw.title, a.s_price, a.e_time;
```
This query retrieves a list of ongoing auctions for a user, including:
- The title of the artwork being auctioned.
- The starting price of the auction.
- The current highest bid price.
- The auction's end time.
---

### 4. **User Reviews Query**

```sql
SELECT 
    r.rating, 
    r.date, 
    r.artwork_id, 
    a.title AS artwork_title, 
    a.image_url AS artwork_image
FROM 
    reviews r
JOIN 
    artworks a ON r.artwork_id = a.artwork_id
WHERE 
    r.uid = $1
ORDER BY 
    r.date DESC;
```
This query fetches reviews written by a user, including:
- The rating given in each review.
- The date of the review.
- The ID of the artwork being reviewed.
- The title and image URL of the artwork.
- Reviews are ordered by date in descending order.


## Auction Queries

### 1. **Trending Auctions Query**

```sql
SELECT 
    auctions.auction_id, 
    artworks.image_url,
    artworks.title AS artwork_title,
    MAX(bids.bid_price) AS highest_bid,
    COUNT(bids.bid_id) AS num_bids,
    auctions.e_time,
    auctions.s_time
FROM auctions
LEFT JOIN bids ON auctions.auction_id = bids.auction_id
LEFT JOIN artworks ON auctions.artwork_id = artworks.artwork_id
WHERE auctions.status = 'ongoing'
GROUP BY auctions.auction_id, artworks.image_url, artworks.title, auctions.e_time, auctions.s_time
ORDER BY num_bids DESC
LIMIT 5;
```

- This query retrieves the top 5 ongoing auctions, ordered by the number of bids (`num_bids`). The query includes the `auction_id`, `image_url`, and `title` of the artwork being auctioned, the highest bid amount (`highest_bid`), the auction start time (`s_time`), and end time (`e_time`). The results help identify which auctions are receiving the most activity and engagement from bidders.

### 2. **Newest Auctions Query**

```sql
SELECT 
    auctions.auction_id, 
    artworks.image_url,
    artworks.title AS artwork_title,
    MAX(bids.bid_price) AS highest_bid,
    auctions.e_time,
    auctions.s_time
FROM auctions
LEFT JOIN bids ON auctions.auction_id = bids.auction_id
LEFT JOIN artworks ON auctions.artwork_id = artworks.artwork_id
WHERE auctions.status = 'ongoing'
GROUP BY auctions.auction_id, artworks.image_url, artworks.title, auctions.e_time, auctions.s_time
ORDER BY auctions.s_time DESC
LIMIT 5;
```
- This query fetches the 5 most recently started ongoing auctions. It retrieves the `auction_id`, `image_url`, `title` of the artwork, the highest bid placed so far (`highest_bid`), and the auction start (`s_time`) and end (`e_time`) times. This query is useful for identifying new and fresh auctions that have recently begun.


### 3. **Upcoming Auctions Query**

```sql
SELECT 
    auctions.auction_id, 
    artworks.image_url,
    artworks.title AS artwork_title,
    auctions.s_time,
    auctions.e_time
FROM auctions
LEFT JOIN artworks ON auctions.artwork_id = artworks.artwork_id
WHERE auctions.s_time > NOW()
ORDER BY auctions.s_time ASC
LIMIT 5;
```

- This query retrieves the top 5 upcoming auctions that have a start time (`s_time`) in the future. It includes the `auction_id`, `image_url`, and `title` of the artwork, along with the start and end times of the auction. This query helps users discover auctions that are about to open for bidding.

### 4. **Auction Details Query**

```sql
SELECT 
    auctions.auction_id, 
    artworks.image_url,
    artworks.title AS artwork_title,
    users.name AS artist_name,
    MAX(bids.bid_price) AS highest_bid,
    auctions.e_time,
    auctions.s_time
FROM auctions
LEFT JOIN bids ON auctions.auction_id = bids.auction_id
LEFT JOIN artworks ON auctions.artwork_id = artworks.artwork_id
LEFT JOIN users ON artworks.artist_id = users.uid
WHERE auctions.auction_id = $1
GROUP BY auctions.auction_id, artworks.image_url, artworks.title, users.name, auctions.e_time, auctions.s_time;
```
- This query retrieves detailed information about a specific auction based on the given `auction_id`. It includes the `auction_id`, `image_url` and `title` of the artwork, the name of the artist (`artist_name`), the highest bid amount (`highest_bid`), and the start (`s_time`) and end times (`e_time`) of the auction. This query is useful for viewing the complete details of a specific auction and its current status.

### 5. **Insert Bid Query**

```sql
INSERT INTO bids (auction_id, bidder_uid, bid_price, bid_time)
VALUES ($1, $2, $3, NOW())
RETURNING *;
```
- This query inserts a new bid into the `bids` table for a specific auction.
    It records the `auction_id`, `bidder_uid` (the ID of the user placing the bid), 
    and the bid amount (`bid_price`). The `bid_time` is set to the current timestamp (`NOW()`), 
    and the query returns the inserted bid details, allowing confirmation of the bid placement.

## 2. Artwork Queries

```sql
SELECT artworks.artwork_id, auctions.auction_id, artworks.title, users.name AS artist, artworks.image_url,
       MAX(bids.bid_price) AS highest_price,
       auctions.status
FROM artworks
JOIN users ON artworks.artist_id = users.uid
JOIN auctions ON artworks.artwork_id = auctions.artwork_id
LEFT JOIN bids ON auctions.auction_id = bids.auction_id
GROUP BY artworks.artwork_id, auctions.status, auctions.auction_id, users.name
ORDER BY highest_price DESC
LIMIT 10;
```
### Description:
This query retrieves the top 10 artworks listed for auction, showing the artwork's title, the artist's name, the artwork's image, the highest bid price, and the status of the auction.

---

## 2. Artwork and Auction Insertion Query

```sql
INSERT INTO artworks (artist_id, title, image_url, start_price)
VALUES ($1, $2, $3, $4)
RETURNING artwork_id;
```
### Description:
This query inserts a new artwork into the database. It includes the artist's ID, the title of the artwork, the URL of the artwork image, and the starting price. The query returns the `artwork_id` of the newly inserted artwork.

---

```sql
INSERT INTO auctions (s_time, e_time, s_price, artwork_id)
VALUES ($1, $2, $3, $4)
RETURNING auction_id;
```
### Description:
This query inserts auction details into the database, including the start and end times, starting price, and the associated artwork ID. It returns the `auction_id` for the newly created auction.

---

## Review Queries

### 1. Check for Existing Review
```sql
SELECT * FROM reviews WHERE uid = $1 AND artwork_id = $2;
```

---

### 2. Update an Existing Review
```sql
UPDATE reviews 
SET rating = $1, date = CURRENT_DATE 
WHERE uid = $2 AND artwork_id = $3;
```

---

### 3. Insert a New Review
```sql
INSERT INTO reviews (uid, rating, artwork_id) 
VALUES ($1, $2, $3);
```

---

### 4. Fetch Review for an Artwork
```sql
SELECT * FROM reviews WHERE artwork_id = $1 AND uid = $2;
```

