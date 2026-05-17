import { describe, it, beforeEach, expect } from 'vitest';
import { CreateOrderUseCase } from '../../src/modules/orders/create-order.usecase';
import { PRODUCT_ID } from '../setup/constanst.ts';
import { testPool, resetDatabase } from '../setup/test_db.ts';

const productsName = 'Test Product';
const productPrice = 100;
const total_stock = 10;
const reserved_stock = 0;

async function seedProducts() {
  await testPool.query(
    `INSERT INTO products(id, name, price)
       VALUES ($1,$2,$3)`,
    [PRODUCT_ID, productsName, productPrice],
  );
}

async function seedInventory() {
  await testPool.query(
    `
      INSERT INTO inventory (product_id, total_stock, reserved_stock)
      VALUES ($1, $2, $3)
    `,
    [PRODUCT_ID, total_stock, reserved_stock],
  );
}


describe('Order Transaction', () => {
  const usecase = new CreateOrderUseCase(testPool);

  beforeEach(async () => {
    await resetDatabase();
    await seedProducts();
    await seedInventory();
  });

  it('should commit transaction when order succeeds', async () => {

    const result = await usecase.execute(PRODUCT_ID, 1, 100);

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
