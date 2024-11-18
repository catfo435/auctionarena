import { Request, Response, NextFunction } from "express";
import pool from "../config/db";

export const getUserIdFromEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = res.locals

    try {
        const query = "SELECT uid FROM users WHERE email = $1";
        const { rows } = await pool.query(query, [email]);

        res.locals.userId = rows[0].uid;
        next();
    } catch (error) {
        console.error("Error fetching user ID from email:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}