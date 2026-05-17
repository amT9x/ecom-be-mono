import { describe, it, beforeEach, expect } from 'vitest';
import { CreateOrderUseCase } from '../../src/modules/orders/create-order.usecase';
import { INVENTORY_RESERVED_STOCK, INVENTORY_TOTAL_STOCK, PRODUCT_ID, PRODUCT_NAME, PRODUCT_PRICE, QUANTITY } from '../setup/constanst.ts';
import { testPool, resetDatabase } from '../setup/test_db.ts';
import { seedInventory, seedProduct } from '../setup/seed-test.ts';

describe('Order Transaction', () => {
  const usecase = new CreateOrderUseCase(testPool);

  beforeEach(async () => {
    await resetDatabase();
    await seedProduct(testPool, PRODUCT_ID, PRODUCT_NAME, PRODUCT_PRICE);
    await seedInventory(testPool, PRODUCT_ID, INVENTORY_TOTAL_STOCK, INVENTORY_RESERVED_STOCK);
  });

  it('should commit transaction when order succeeds', async () => {

    const result = await usecase.execute(PRODUCT_ID, QUANTITY, PRODUCT_PRICE);

    expect(result.id).toBeDefined();

    // verify order committed
    const { rows: orders } = await testPool.query(
      'SELECT * FROM orders WHERE id = $1',
      [result.id],
    );

    expect(orders.length).toBe(1);

    // verify stock reduced
    const { rows: inventory } = await testPool.query(
      'SELECT total_stock, reserved_stock FROM inventory WHERE product_id = $1',
      [PRODUCT_ID],
    );

    const available = inventory[0].total_stock - inventory[0].reserved_stock;

    expect(available).toBe(9);
  });

  it('should rollback if stock is insufficient', async () => {
    await expect(
      usecase.execute('non-existing-product', 999, 100),
    ).rejects.toThrow();

    // verify NO order created
    const { rows: orders } = await testPool.query('SELECT * FROM orders');

    expect(orders.length).toBe(0);

    // verify stock unchanged
    const { rows: inventory } = await testPool.query(
      'SELECT total_stock, reserved_stock FROM inventory WHERE product_id = $1',
      [PRODUCT_ID],
    );

    expect(inventory[0].total_stock).toBe(10);
  });
});
