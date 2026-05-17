import { Pool } from 'pg';
import { env } from './env.js';

if (!env.DB_URL) {
  throw new Error('DB_URL missing');
}

let pool: Pool;

export function initializeDB() {
  pool = new Pool({
    connectionString: env.DB_URL,
    max: 20, // connection pool size
  });

  pool.on('connect', () => {
    console.log('DB connected successfully');
  });

  // pool.on('error', (err) => {
  //   console.error('DB connection error:', err);
  // })

  return pool;
}

export function getPool() {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  return pool;
}
