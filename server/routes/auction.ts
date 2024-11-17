import { Router, Request, Response } from "express";
import pool from "../config/db";

const router: Router = Router()

router.get('/', async (req: Request, res: Response) => {
    try {
        const trendingQuery = `
            SELECT 
                auctions.auction_id, 
                artworks.image_url,
                artworks.title as artwork_title,
                MAX(bids.bid_price) AS highest_bid,
                auctions.e_time
            FROM auctions
            LEFT JOIN bids ON auctions.auction_id = bids.auction_id
            LEFT JOIN artworks ON auctions.artwork_id = artworks.artwork_id
            WHERE auctions.status = 'ongoing'
            GROUP BY auctions.auction_id, artworks.image_url,artworks.title, auctions.e_time
            ORDER BY highest_bid DESC
            LIMIT 5;
        `;

        const newestQuery = `
            SELECT 
                auctions.auction_id, 
                artworks.image_url,
                artworks.title as artwork_title,
                MAX(bids.bid_price) AS highest_bid,
                auctions.e_time
            FROM auctions
            LEFT JOIN bids ON auctions.auction_id = bids.auction_id
            LEFT JOIN artworks ON auctions.artwork_id = artworks.artwork_id
            WHERE auctions.status = 'ongoing'
            GROUP BY auctions.auction_id, artworks.image_url,artworks.title, auctions.e_time
            ORDER BY auctions.s_time DESC
            LIMIT 5;
        `;

        // Execute both queries in parallel using Promise.all
        const [trendingResult, newestResult] = await Promise.all([
            pool.query(trendingQuery),
            pool.query(newestQuery),
        ]);

        // Send both results in the response
        res.json({
            trendingAuctions: trendingResult.rows,
            newestAuctions: newestResult.rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

export default router