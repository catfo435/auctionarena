import { Router, Request, Response } from "express";
import pool from "../config/db";
import { authenticateToken } from "../middleware/authenticateToken";
import { getUserIdFromEmail } from "../middleware/getUserIdFromEmail";

const router: Router = Router()

router.use(authenticateToken)

router.get('/', async (req: Request, res: Response) => {
    try {
        const trendingQuery = `
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
            ORDER BY highest_bid DESC
            LIMIT 5;
        `;

        const newestQuery = `
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
        `;

        const upcomingQuery = `
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
        `;

        // Execute all three queries in parallel using Promise.all
        const [trendingResult, newestResult, upcomingResult] = await Promise.all([
            pool.query(trendingQuery),
            pool.query(newestQuery),
            pool.query(upcomingQuery),
        ]);

        const trendingAuctions = trendingResult.rows.map(row => ({
            ...row,
            highest_bid: parseFloat(row.highest_bid),
        }));

        const newestAuctions = newestResult.rows.map(row => ({
            ...row,
            highest_bid: parseFloat(row.highest_bid),
        }));

        const upcomingAuctions = upcomingResult.rows.map(row => ({
            ...row,
        }));

        // Send all three results in the response
        res.json({
            trendingAuctions,
            newestAuctions,
            upcomingAuctions,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    const query = `
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
        GROUP BY auctions.auction_id, artworks.image_url, artworks.title, users.name, auctions.e_time, auctions.s_time
    `;

    try {
        const auctionResult = await pool.query(query, [id]);

        if (!auctionResult.rowCount) {
            res.status(404).send("No auction found with the given id.");
            return;
        }

        const auction = auctionResult.rows.map(row => ({
            ...row,
            highest_bid: parseFloat(row.highest_bid),
        }));

        res.json(auction[0]);
    } catch (error) {
        console.error("Error retrieving auction:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/:id/bid", getUserIdFromEmail, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { amount } = req.body;
    const { userId } = res.locals;

    if (!amount || !userId) {
        res.status(400).json({ error: "Missing required fields: amount or userId." });
        return;
    }

    try {
        const insertBidQuery = `
            INSERT INTO bids (auction_id, bidder_uid, bid_price, bid_time)
            VALUES ($1, $2, $3, NOW())
            RETURNING *;
        `;
        const bidResult = await pool.query(insertBidQuery, [id, userId, amount]);

        res.status(201).json({
            message: "Bid placed successfully.",
            bid: bidResult.rows[0],
        });
    } catch (err: any) {
        console.error(err);
        if (err.code) {
            // Handle PostgreSQL-specific errors
            res.status(400).json({ message: err.toString() });
        } else {
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
});

export default router