import { describe, it, beforeEach, expect } from 'vitest';
import { CreateOrderUseCase } from '../../src/modules/orders/create-order.usecase';
import { PRODUCT, USER, QUANTITY, INVENTORY} from '../setup/constanst.ts';
import { testPool, resetDatabase } from '../setup/test_db.ts';
import { seedInventory, seedProduct } from '../setup/seed-test.ts';

describe('Order Transaction', () => {
  const usecase = new CreateOrderUseCase(testPool);

  beforeEach(async () => {
    await resetDatabase();
    await seedProduct(testPool, PRODUCT.id, PRODUCT.name, PRODUCT.price);
    await seedInventory(
      testPool,
      PRODUCT.id,
      INVENTORY.total_stock,
      INVENTORY.reserved_stock
    );
  });

  it('should commit transaction when order succeeds', async () => {
    const result = await usecase.execute({
      userId: USER.id,
      items: [
        {
          productId: PRODUCT.id,
          quantity: QUANTITY,
          price: 100,
          totalAmount: 1000,
        },
      ],
    });

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
      [PRODUCT.id],
    );

    const available = inventory[0].total_stock - inventory[0].reserved_stock;

    expect(available).toBe(0);
  });

  it('should rollback if stock is insufficient', async () => {
    await expect(
      usecase.execute({
        userId: USER.id,
        items: [
          {
            productId: 'non-existing-product',
            quantity: 999,
            price: 100,
            totalAmount: 99900,
          },
        ],
      }),
    ).rejects.toThrow();

    // verify NO order created
    const { rows: orders } = await testPool.query('SELECT * FROM orders');

    expect(orders.length).toBe(0);

    // verify stock unchanged
    const { rows: inventory } = await testPool.query(
      'SELECT total_stock, reserved_stock FROM inventory WHERE product_id = $1',
      [PRODUCT.id],
    );

    expect(inventory[0].total_stock).toBe(10);
  });
});
