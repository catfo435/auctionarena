import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString : process.env.PGCONN_STRING
});

pool.on('connect', () => {
    console.log('Connected to the database');
});

export default pool;
