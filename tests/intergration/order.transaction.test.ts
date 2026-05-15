import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { Pool } from 'pg';
import { env } from '../../src/config/env.ts';

import { CreateOrderUseCase } from '../../src/modules/orders/create-order.usecase';
import { OrderRepository } from '../../src/modules/orders/order.repository';
import { PostgresOrderRepository } from '../../src/modules/orders/postgres-order.repository';
import { InventoryRepository } from '../../src/modules/inventory/inventory.repository';
import { InventoryService } from '../../src/modules/inventory/inventory.service';
import { PostgestInventoryRepository } from '../../src/modules/inventory/postgres-inventory.repository';
import { PRODUCT_ID } from '../setup/constanst.ts';

console.log('DB_URL: ', env.DB_URL);

describe('Order Transaction', () => {
  let pool: Pool;

  beforeAll(async () => {
    pool = new Pool({
      connectionString: env.DB_URL,
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query(`
    TRUNCATE
      order_items,
      orders,
      inventory,
      products
    RESTART IDENTITY CASCADE
  `);

    await pool.query(
      `INSERT INTO products(id, name, price)
         VALUES ($1,$2,$3)`,
      [PRODUCT_ID, 'Test Product', 100],
    );

    // seed inventory
    await pool.query(
      `
      INSERT INTO inventory (product_id, total_stock, reserved_stock)
      VALUES ($1, $2, $3)
    `,
      [PRODUCT_ID, 10, 0],
    );
  });

  const inventoryFactory = (client: any) => {
    const repo = new PostgestInventoryRepository(client);
    return new InventoryService(repo);
  };

  const orderRepoFactory = (client: any) => {
    return new PostgresOrderRepository(client);
  };

  it('should commit transaction when order succeeds', async () => {
    const orderUsecase = new CreateOrderUseCase(
      inventoryFactory,
      orderRepoFactory,
      pool,
    );

    const result = await orderUsecase.execute(PRODUCT_ID, 1, 100);

    expect(result.id).toBeDefined();

    // verify order committed
    const { rows: orders } = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [result.id],
    );

    expect(orders.length).toBe(1);

    // verify stock reduced
    const { rows: inventory } = await pool.query(
      'SELECT total_stock, reserved_stock FROM inventory WHERE product_id = $1',
      [PRODUCT_ID],
    );

    const available = inventory[0].total_stock - inventory[0].reserved_stock;

    expect(available).toBe(9);
  });

  it('should rollback if stock is insufficient', async () => {
    const orderUsecase = new CreateOrderUseCase(
      inventoryFactory,
      orderRepoFactory,
      pool,
    );

    await expect(
      orderUsecase.execute('non-existing-product', 999, 100),
    ).rejects.toThrow();

    // verify NO order created
    const { rows: orders } = await pool.query('SELECT * FROM orders');

    expect(orders.length).toBe(0);

    // verify stock unchanged
    const { rows: inventory } = await pool.query(
      'SELECT total_stock, reserved_stock FROM inventory WHERE product_id = $1',
      [PRODUCT_ID],
    );

    expect(inventory[0].total_stock).toBe(10);
  });
});
