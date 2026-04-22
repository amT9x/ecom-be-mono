import { pool } from '../../config/database.js';

export async function connectDB() {
  try {
    const client = await pool.connect(); // db health check/ mượn connection từ pool

    try {
      const res = await client.query('SELECT NOW()'); // create first connection/ sử dụng connection
      console.log('DB connected successfully at:', res.rows[0].now);
    } finally {
      client.release(); // trả connection về pool để tái sử dụng
    }
  } catch (err) {
    console.error('DB connection failed:', err);
    process.exit(1); // Exit the process if connect to db failed
  }
}
