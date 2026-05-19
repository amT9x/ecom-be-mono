import { Pool } from 'pg';
import { env } from '../../src/config/env.js';

if (!env.DB_URL) {
  throw new Error('DATABASE_URL env is required');
}

async function main() {
  console.log('=== HEALTHCHECK ===');

  const pool = new Pool({
    connectionString: env.DB_URL,
  });

  try {
    const client = await pool.connect();

    const result = await client.query('SELECT NOW() as now');

    console.log('Database connected');
    console.log('Server time:', result.rows[0].now);

    client.release();
  } catch (err) {
    console.error('Healthcheck failed');
    console.error(err);
  } finally {
    await pool.end();
  }

  console.log('=== ✅ HEALTHCHECK DONE ===');
}

main();
