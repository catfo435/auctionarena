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

const interval = 30000;

function keepAlive() {
  fetch(process.env.FRONTEND_URL!)
    .then((response) => {
      console.log(`Pinged at ${new Date().toISOString()}: Status Code ${response.status}`);
    })
    .catch((error) => {
      console.error(`Error pinging at ${new Date().toISOString()}:, ${error.message}`);
    });
}

setInterval(keepAlive, interval)

const modifyAuctions = async () => {
  try {
      const query = `
          -- Mark auctions as ongoing if their start time has passed and end time is in the future
          UPDATE auctions
          SET status = 'ongoing'
          WHERE status = 'future' AND s_time <= NOW();

          -- Mark auctions as ended if their end time has passed
          UPDATE auctions
          SET status = 'ended'
          WHERE status = 'ongoing' AND e_time < NOW();
      `;
      
      // Run the query using NOW() directly in the SQL
      const result = await pool.query(query);

      if (result.rowCount) {
          console.log(`Modified ${result.rowCount} auction(s).`);
      } else {
          console.log('No auctions to modify.');
      }
  } catch (error) {
      console.error('Error modifying auctions:', error);
  }
};

// Schedule the task to run every minute
setInterval(() => {
  modifyAuctions();
}, 60 * 1000);

app.get('/api', (req: Request, res: Response) => {
  res.send('Welcome to the API for Art Auction Portal');
});

app.get('/api/check-auth',authenticateToken, (req: Request, res: Response) => {
  res.send('API (Authenticated)')
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
