import { Router, Request, Response } from "express";
import dotenv from 'dotenv';
import { authenticateToken } from "../middleware/authenticateToken";
import { OAuth2Client } from "google-auth-library";
import pool from "../config/db";
dotenv.config();

const router: Router = Router()

router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
    });

    res.status(200).json({ message: 'Logged out successfully' });
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