import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import pool from './config/db';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { authenticateToken } from './middleware/authenticateToken';
import userRoutes from './routes/user'
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

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the API for Art Auction Portal');
});

app.get('/api/check-auth',authenticateToken, (req: Request, res: Response) => {
  res.send('API (Authenticated)')
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
