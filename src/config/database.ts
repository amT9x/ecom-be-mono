import { Pool } from 'pg';
import { env } from './env.js';

export const pool = new Pool({
  connectionString: env.DB_URL,
  max: 20, // connection pool size
});
