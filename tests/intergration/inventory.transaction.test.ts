import { describe, beforeEach, it, expect } from 'vitest';
import { testPool, resetDatabase } from '../setup/test_db.js';
import { InventoryRepository } from '../../src/modules/inventory/inventory.repository.js';
import { InventoryService } from '../../src/modules/inventory/inventory.service';

const PRODUCT_ID = '11111111-1111-1111-1111-111111111111';
const item1 = 'Item-test 1';
const price = 10000;
const total_stock = 10;
const reserved_stock = 0;

async function seedInventory() {
  await testPool.query(
    `INSERT INTO products(id, name, price)
     VALUES ($1,$2,$3)`,
    [PRODUCT_ID, item1, price],
  );

  await testPool.query(
    `INSERT INTO inventory(product_id,total_stock,reserved_stock)
     VALUES ($1,$2,$3)`,
    [PRODUCT_ID, total_stock, reserved_stock],
  );
}

describe('Inventory Transaction', () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedInventory();
  });

  it('should reserve stock inside transaction', async () => {
    const client = await testPool.connect();

    try {
      await client.query('BEGIN');

      const repo = new InventoryRepository(client);
      const service = new InventoryService(repo);

      await service.reserveStock(PRODUCT_ID, 3);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
    finally {
      client.release();
    }

    const result = await testPool.query(
      `SELECT reserved_stock FROM inventory WHERE product_id=$1`
      , [PRODUCT_ID]
    );

    expect(result.rows[0].reserved_stock).toBe(3);
  });
});
