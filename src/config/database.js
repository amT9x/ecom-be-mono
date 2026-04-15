import { Pool } from 'pg';
import { db } from './env.js';

export const pool = new Pool({
  host: db.host,
  port: db.port,
  user: db.user,
  password: db.password,
  database: db.database,
  max: 20, // connection pool size
});
