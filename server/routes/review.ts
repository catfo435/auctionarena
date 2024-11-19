import { Router, Request, Response } from "express";
import pool from "../config/db";
import { authenticateToken } from "../middleware/authenticateToken";
import { getUserIdFromEmail } from "../middleware/getUserIdFromEmail";

const router: Router = Router()

router.use(authenticateToken)

router.post("/",getUserIdFromEmail, async (req : Request, res : Response) => {
    const { rating, artwork_id } = req.body;
    const { userId } = res.locals

    if (!userId || !rating || !artwork_id) {
        res.status(400).json({ error: "Missing required fields." })
        return
    }

    try {
        const existingReview = await pool.query(
            "SELECT * FROM reviews WHERE uid = $1 AND artwork_id = $2",
            [userId, artwork_id]
        );

        if (existingReview.rows.length > 0) {
            console.log([rating, userId, artwork_id])
            await pool.query(
                "UPDATE reviews SET rating = $1 , date = CURRENT_DATE WHERE uid = $2 AND artwork_id = $3",
                [rating, userId, artwork_id]
            );
            res.status(200).json({ message: "Review updated successfully." });
            return
        }

        await pool.query(
            "INSERT INTO reviews (uid, rating, artwork_id) VALUES ($1, $2, $3)",
            [userId, rating, artwork_id]
        );
        res.status(201).json({ message: "Review submitted successfully." });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "An error occurred while submitting the review." });
    }
});

export default router
