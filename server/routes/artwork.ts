import { Router, Request, Response } from "express";
import pool from "../config/db";
import { authenticateToken } from "../middleware/authenticateToken";

const router: Router = Router()

router.use(authenticateToken)

router.get('/', async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT artworks.artwork_id,auctions.auction_id, artworks.title,users.name artist, artworks.image_url,
                   MAX(bids.bid_price) AS highest_price,
                   auctions.status
            FROM artworks
            JOIN users on artworks.artist_id=users.uid
            JOIN auctions ON artworks.artwork_id = auctions.artwork_id
            LEFT JOIN bids ON auctions.auction_id = bids.auction_id
            GROUP BY artworks.artwork_id,auctions.status,auctions.auction_id,users.name
            ORDER BY highest_price DESC
            LIMIT 10;
        `;

        const result = await pool.query(query);

        const artworks = result.rows.map(row => ({
            ...row,
            highest_price: parseFloat(row.highest_price),
        }));

        res.json({ artworks });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

export default router