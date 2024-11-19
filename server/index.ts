import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import pool from './config/db';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { authenticateToken } from './middleware/authenticateToken';
import userRoutes from './routes/user'
import auctionRoutes from './routes/auction'
import artworkRoutes from './routes/artwork'
import reviewRoutes from './routes/review'
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

pool.connect()

app.use(express.json());
app.use(cookieParser())

app.use(cors({
  origin : process.env.FRONTEND_URL,
  credentials : true
}))

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.use("/api/user",userRoutes)
app.use("/api/auction",auctionRoutes)
app.use("/api/artwork",artworkRoutes)
app.use("/api/review",reviewRoutes)

const invalidateAuctions = async () => {
  try {
      const now = new Date();
      const query = `
          UPDATE auctions
          SET status = 'ended'
          WHERE status = 'ongoing' AND e_time < $1::timestamp
      `;
      const result = await pool.query(query, [now]);

      if (result.rowCount) {
          console.log(`Invalidated ${result.rowCount} auction(s):`, result.rows.map(row => row.auction_id));
      } else {
          console.log('No auctions to invalidate.');
      }
  } catch (error) {
      console.error('Error invalidating auctions:', error);
  }
};

// Schedule the task to run every minute
// setInterval(() => {
//   invalidateAuctions();
// }, 60 * 1000);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the API for Art Auction Portal');
});

app.get('/api/check-auth',authenticateToken, (req: Request, res: Response) => {
  res.send('API (Authenticated)')
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
