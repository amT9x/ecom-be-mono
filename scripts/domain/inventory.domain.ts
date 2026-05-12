import 'dotenv/config';
import { Pool } from 'pg';
import { InventoryService } from '../../src/modules/inventory/inventory.service.js';
import { NotFoundError } from '../../src/shared/errors/http-error.js';

async function main() {
  const DB_URL = "postgresql://ecom_app:devpw@localhost:5432/ecom_mono";

  const pool = new Pool({
    connectionString: DB_URL,
  });

  const inventory = new InventoryService(pool);

  const { rows } = await pool.query(`
  SELECT product_id
  FROM inventory
  LIMIT 1
`);

  if (!rows.length) {
    throw new NotFoundError('No inventory found. Run seed first.');
  }

  const productId = rows[0].product_id;

  console.log('check stock...');
  const available = await inventory.checkAvailableStock(productId, 1);
  console.log('available:', available);

  console.log('reserve...');
  await inventory.reserveStock(productId, 1);

  console.log('release...');
  await inventory.releaseStock(productId, 1);

  console.log('reserve again...');
  await inventory.reserveStock(productId, 1);

  console.log('deduct...');
  await inventory.deductStock(productId, 1);

  console.log('done ✅');

  await pool.end();
}

main().catch(console.error);
