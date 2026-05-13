import { Pool } from 'pg';

export const testPool = new Pool({
  connectionString:
    process.env.TEST_DATABASE_URL ||
    'postgres://postgres:postgres@localhost:5432/ecom_test',
});

export async function resetDatabase() {
  await testPool.query(`
    TRUNCATE inventory, products RESTART IDENTITY CASCADE;
  `);
}
