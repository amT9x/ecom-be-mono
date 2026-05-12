import { Pool } from 'pg';
import 'dotenv/config';

const DB_URL = 'postgresql://ecom_app:devpw@localhost:5432/ecom_mono';

async function seed() {
  const pool = new Pool({
    connectionString: DB_URL,
  });

  // lấy product có sẵn
  const { rows } = await pool.query(`
    SELECT id, stock
    FROM products
    LIMIT 5
  `);

  for (const p of rows) {
    await pool.query(
      `
      INSERT INTO inventory (product_id, total_stock, reserved_stock)
      VALUES ($1, $2, 0)
      ON CONFLICT (product_id) DO NOTHING
      `,
      [p.id, p.stock],
    );
  }

  console.log('inventory seeded ✅');
  await pool.end();
}

seed();
