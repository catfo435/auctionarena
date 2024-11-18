import { Router, Request, Response } from "express";
import pool from "../config/db";

const router: Router = Router()

router.get('/', async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT artworks.artwork_id,auctions.auction_id, artworks.title, artworks.image_url,
                   MAX(bids.bid_price) AS highest_price,
                   auctions.status
            FROM artworks
            JOIN auctions ON artworks.artwork_id = auctions.artwork_id
            LEFT JOIN bids ON auctions.auction_id = bids.auction_id
            GROUP BY artworks.artwork_id,auctions.status,auctions.auction_id
            ORDER BY highest_price DESC
            LIMIT 10;
        `;

        const result = await pool.query(query);
        res.json({ artworks: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

export default router