import 'dotenv/config';
import { Pool } from 'pg';
import { InventoryService } from '../../src/modules/inventory/inventory.service.js';
import { PostgestInventoryRepository } from '../../src/modules/inventory/postgres-inventory.repository.js';
import { NotFoundError } from '../../src/shared/errors/http-error.js';

async function main() {
  const pool = new Pool({
    connectionString: process.env.DB_URL,
  });

  const client = await pool.connect(); // TRANSACTION CLIENT
  const observer = await pool.connect(); // OBSERVER CLIENT

  try {
    await client.query('BEGIN');

    const repo = new PostgestInventoryRepository(client);
    const service = new InventoryService(repo);

    const { rows } = await observer.query(`
      SELECT product_id FROM inventory LIMIT 1
    `);

    if (!rows.length) {
      throw new NotFoundError('No inventory found');
    }

    const productId = rows[0].product_id;

    async function logState(label: string) {
      const { rows } = await observer.query(
        `SELECT total_stock, reserved_stock
         FROM inventory
         WHERE product_id = $1`,
        [productId],
      );

      console.log(label, rows[0]);
    }

    await logState('🔎 BEFORE');

    console.log('reserve...');
    await service.reserveStock(productId, 1);

    await logState('🔎 AFTER RESERVE (should NOT change)');

    console.log('server crash...');
    process.exit(1);

    await client.query('COMMIT');
    console.log('Done');
  } catch (e) {
    console.log('ROLLBACK triggered');
    await client.query('ROLLBACK');
    console.error(e);
  } finally {
    client.release();
    observer.release();
    await pool.end();
  }
}

main();
