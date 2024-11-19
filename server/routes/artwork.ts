import { Router, Request, Response } from "express";
import pool from "../config/db";
import { authenticateToken } from "../middleware/authenticateToken";
import supabase from "../config/supabaseClient";
import multer from "multer";
import { getUserIdFromEmail } from "../middleware/getUserIdFromEmail";

const router: Router = Router()
const upload = multer({ storage: multer.memoryStorage() })

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

router.post("/",getUserIdFromEmail, upload.single("image"), async (req: Request, res: Response) => {
    const { artworkTitle, startPrice, startTime, endTime } = req.body;
    const { userId : artistId} = res.locals
    const file = req.file;

    if (!artistId || !artworkTitle || !file || !startPrice || !startTime || !endTime) {
        res.status(400).json({ error: "All fields are required" });
        return
    }

    try {
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("artworks")
            .upload(`artworks/${Date.now()}-${file.originalname}`, file.buffer, {
                contentType: file.mimetype,
            });

        if (uploadError) {
            throw uploadError;
        }

        const { data : { publicUrl } } = supabase.storage.from("artworks").getPublicUrl(uploadData.path);

        const client = await pool.connect();
        await client.query("BEGIN");

        const insertArtworkQuery = `
            INSERT INTO artworks (artist_id, title, image_url, start_price)
            VALUES ($1, $2, $3, $4)
            RETURNING artwork_id;
        `;
        const artworkResult = await client.query(insertArtworkQuery, [artistId, artworkTitle, publicUrl, startPrice]);
        const artworkId = artworkResult.rows[0].artwork_id;

        const insertAuctionQuery = `
            INSERT INTO auctions (s_time, e_time, s_price, artwork_id)
            VALUES ($1, $2, $3, $4)
            RETURNING auction_id;
        `;
        const auctionResult = await client.query(insertAuctionQuery, [startTime, endTime, startPrice, artworkId]);
        const auctionId = auctionResult.rows[0].auction_id;

        await client.query("COMMIT");

        res.status(201).json({
            message: "Artwork and auction created successfully",
            artworkId,
            auctionId,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to create artwork and auction", message: (error as Error).message });
    }
});

export default router