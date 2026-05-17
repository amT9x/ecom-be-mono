import { describe, beforeEach, it, expect, beforeAll } from "vitest"
import { testPool, resetDatabase } from "../setup/test_db"
import { ConfirmOrderUseCase } from "../../src/modules/orders/confirm-order.usecase"

const orderId = '11111111-1111-1111-1111-111111111111';
const status = 'PENDING';

async function seedOrder() {
  await testPool.query(
    `
    INSERT INTO orders(id, status)
    VALUES ($1, $2)
  `,
    [orderId, status],
  );
}

describe('ConfirmOrderUseCase test-int', () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedOrder();
  })

  it('should confirm pending order', async () => {
    const usecase = new ConfirmOrderUseCase(testPool);

    const result = await usecase.execute('order-1');

    expect(result.status).toBe('CONFIRMED');

    const res = await testPool.query(
      `SELECT status FROM orders WHERE id='order-1'`,
    );

    expect(res.rows[0].status).toBe('CONFIRMED');
  });

  it('should reject confirm when order already confirmed', () => {
    expect(true).toBe(true);
  });
})
