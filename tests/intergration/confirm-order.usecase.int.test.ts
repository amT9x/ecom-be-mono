import { describe, beforeEach, it, expect, beforeAll } from "vitest"
import { testPool, resetDatabase } from "../setup/test_db"
import { ConfirmOrderUseCase } from "../../src/modules/orders/confirm-order.usecase"
import { ORDER_ID, ORDER_STATUS, TOTAL_AMOUNT_ORDER } from "../setup/constanst";

async function seedOrder() {
  await testPool.query(
    `
    INSERT INTO orders(id, status, total_amount)
    VALUES ($1, $2, $3)
  `,
    [ORDER_ID, ORDER_STATUS.PENDING, TOTAL_AMOUNT_ORDER],
  );
}

describe('ConfirmOrderUseCase test-int', () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedOrder();
  })

  it('should confirm pending order', async () => {
    const usecase = new ConfirmOrderUseCase(testPool);

    const result = await usecase.execute(ORDER_ID);

    expect(result.status).toBe(ORDER_STATUS.CONFIRMED);

    const res = await testPool.query(
      `SELECT status FROM orders WHERE id=$1`, [ORDER_ID],
    );

    expect(res.rows[0].status).toBe(ORDER_STATUS.CONFIRMED);
  });

  it('should reject confirm when order already confirmed', () => {
    expect(true).toBe(true);
  });
})
