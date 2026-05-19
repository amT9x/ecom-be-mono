import { Pool } from 'pg';
import { env } from '../../src/config/env.ts';

if (!env.DB_URL) {
  throw new Error('DB_URL missing');
}

console.log('DB_URL', env.DB_URL);

export const testPool = new Pool({
  connectionString:
    env.DB_URL
});

export async function resetDatabase() {
  await testPool.query(`
    TRUNCATE inventory, products, orders, order_items, payments RESTART IDENTITY CASCADE;
  `);
}
