import { Router, Request, Response, NextFunction } from "express";
import dotenv from 'dotenv';
import { authenticateToken } from "../middleware/authenticateToken";
import { OAuth2Client } from "google-auth-library";
import pool from "../config/db";
dotenv.config();

const getUserIdFromEmail = async (req: Request, res: Response, next: NextFunction) => {
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

const router: Router = Router()

router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
    });

    res.status(200).json({ message: 'Logged out successfully' });
})

router.get('/info', authenticateToken, getUserIdFromEmail, async (req: Request, res: Response) => {
    const { userId } = res.locals;
    const { all } = req.query; // Get the 'all' query parameter

    try {
        // Basic user info query
        let user = await pool.query("SELECT name, email FROM users WHERE uid=$1", [userId]);
        if (!user.rowCount) {
            res.status(403).send("Invalid User");
            return
        }

        // If 'all' query param is true, fetch additional details
        if (all === 'true') {
            const statsQuery = `
                SELECT
                    (SELECT COUNT(*) FROM bids WHERE bidder_uid = $1) AS bids_placed,
                    (SELECT COUNT(*) FROM auction_history WHERE uid = $1) AS total_auctions,
                    (SELECT COUNT(*) FROM auction_results WHERE winner_uid = $1) AS auctions_won,
                    (SELECT COUNT(DISTINCT a.auction_id)
                     FROM bids b
                     JOIN auctions a ON b.auction_id = a.auction_id
                     WHERE b.bidder_uid = $1 AND a.status='ongoing'
                     AND b.bid_price = (SELECT MAX(bid_price) FROM bids WHERE auction_id = b.auction_id)) AS auctions_leading
            `;
            const stats = await pool.query(statsQuery, [userId]);

            // Merge user info and stats
            const userInfo = { ...user.rows[0], ...stats.rows[0] };
            res.send(userInfo);
            return
        }

        // Otherwise, send only basic user info
        res.send(user.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/dashboard', authenticateToken,getUserIdFromEmail, async (req: Request, res: Response) => {
    const { userId } = res.locals;

    try {
        // Query for dashboard data
        const dashboardQuery = `
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
        `;

        // Query for auctions list
        const auctionsQuery = `
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
        `;

        // Run both queries concurrently
        const [dashboardResult, auctionsResult] = await Promise.all([
            pool.query(dashboardQuery, [userId]),
            pool.query(auctionsQuery, [userId])
        ]);

        const { active_auctions, auctions_won, auctions_in_lead } = dashboardResult.rows[0];
        const auctions = auctionsResult.rows;

        // Combine and send response
        res.json({
            dashboardData: {
                activeAuctions: active_auctions,
                auctionsWon: auctions_won,
                auctionsInLead: auctions_in_lead,
            },
            auctions,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/reviews',authenticateToken,getUserIdFromEmail, async (req : Request, res : Response) => {
    try {
        const { userId } = res.locals

        const query = `
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
        `;

        const { rows } = await pool.query(query, [userId]);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

router.get('/auctionswon', authenticateToken,getUserIdFromEmail, async (req: Request, res: Response) => {
    const { userId } = res.locals;

    try {
        const query = `
            SELECT 
                aw.title AS artwork_name,
                a.s_price AS start_price,
                ar.final_price AS price_won_at,
                TO_CHAR(a.e_time, 'YYYY-MM-DD HH24:MI:SS') AS end_time
            FROM auctions a
            JOIN artworks aw ON a.artwork_id = aw.artwork_id
            JOIN auction_results ar ON a.auction_id = ar.auction_id
            WHERE ar.winner_uid = $1;
        `;

        const { rows } = await pool.query(query, [userId]);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get('/bids', authenticateToken, getUserIdFromEmail, async (req: Request, res: Response) => {
    const { userId } = res.locals;

    try {
        const query = `
            SELECT 
                aw.title AS artwork_name,
                b.bid_price AS bid_amount,
                TO_CHAR(b.bid_time, 'YYYY-MM-DD HH24:MI:SS') AS bid_date
            FROM bids b
            JOIN auctions a ON b.auction_id = a.auction_id
            JOIN artworks aw ON a.artwork_id = aw.artwork_id
            WHERE b.bidder_uid = $1
            ORDER BY b.bid_time DESC;  -- Ordered by the latest bid first
        `;

        const { rows } = await pool.query(query, [userId]);

        if (rows.length === 0) {
            res.status(404).json({ message: "No bids found for this user" })
            return
        }

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

router.post('/login', async (req: Request, res: Response) => {
    const credentialResponse = req.body;
    const client = new OAuth2Client()

    try {
        const ticket = await client.verifyIdToken({
            idToken: credentialResponse.credential,
            audience: process.env.OAUTH_CID
        });

        const { email } = ticket.getPayload() as any;

        let user = await pool.query("SELECT name FROM users WHERE email=$1", [email])

        if (!user.rowCount) {
            res.status(404).send("You are not allowed to login.")
            return
        }

        res.cookie("token", credentialResponse.credential, {
            secure: process.env.DEPLOYED_STATUS === "true",
            httpOnly: true,
            sameSite: process.env.DEPLOYED_STATUS === "true" ? "none" : "lax"
        });
        res.send("Login Successful");
    } catch (error) {
        console.error(error);
        res.status(403).send("Invalid Credentials");
    }
});

router.post('/signup', async (req: Request, res: Response) => {
    const { credential } = req.body;

    try {
        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.OAUTH_CID,
        });

        const { email, name } = ticket.getPayload() as any;

        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (existingUser.rowCount) {
            res.status(409).send("User with this email already exists.");
            return;
        }

        await pool.query(
            "INSERT INTO users (name, email) VALUES ($1, $2)",
            [name, email]
        );

        res.status(201).send("User created successfully!");
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error while signing up.");
    }
})

export default router