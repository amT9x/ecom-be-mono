import { describe, beforeEach, it, expect } from 'vitest';
import { testPool, resetDatabase } from '../../setup/test_db.js';
import { PostgestInventoryRepository } from '../../../src/modules/inventory/infrastructure/postgres-inventory.repository.js';
import { InventoryService } from '../../../src/modules/inventory/domain/inventory.service';
import { PRODUCT, INVENTORY } from '../../setup/constanst.js';
import { seedProduct,seedInventory } from '../../setup/seed-test.js';

describe('Inventory Transaction', () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedProduct(testPool, PRODUCT.id, PRODUCT.name, PRODUCT.price);
    await seedInventory(testPool, PRODUCT.id, INVENTORY.total_stock, INVENTORY.reserved_stock);
  });

  it('should reserve stock inside transaction', async () => {
    const client = await testPool.connect();

    try {
      await client.query('BEGIN');

      const repo = new PostgestInventoryRepository(client);
      const service = new InventoryService(repo);

      await service.reserveStock([{
        productId: PRODUCT.id,
        quantity: 3
      }]);

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
      , [PRODUCT.id]
    );

    expect(result.rows[0].reserved_stock).toBe(3);
  });
});
