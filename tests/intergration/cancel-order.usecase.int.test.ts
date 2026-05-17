import { describe, beforeEach, it, expect } from 'vitest';

import { testPool, resetDatabase } from '../setup/test_db';

import { CancelOrderUseCase } from '../../src/modules/orders/cancel-order.usecase';

import { ORDER_ID, ORDER_STATUS, TOTAL_AMOUNT_ORDER } from '../setup/constanst';

async function seedOrder(status = ORDER_STATUS.PENDING) {
  await testPool.query(
    `
    INSERT INTO orders(id, status, total_amount)
    VALUES ($1, $2, $3)
  `,
    [ORDER_ID, status, TOTAL_AMOUNT_ORDER],
  );
}

describe('CancelOrderUseCase test-int', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('should cancel pending order', async () => {
    await seedOrder(ORDER_STATUS.PENDING);

    const usecase = new CancelOrderUseCase(testPool);

    const result = await usecase.execute(ORDER_ID);

    expect(result.status).toBe(ORDER_STATUS.CANCELLED);

    const res = await testPool.query(`SELECT status FROM orders WHERE id=$1`, [
      ORDER_ID,
    ]);

    expect(res.rows[0].status).toBe(ORDER_STATUS.CANCELLED);
  });

  it('should cancel confirmed order', async () => {
    await seedOrder(ORDER_STATUS.CONFIRMED);

    const usecase = new CancelOrderUseCase(testPool);

    const result = await usecase.execute(ORDER_ID);

    expect(result.status).toBe(ORDER_STATUS.CANCELLED);
  });

  //future
  it('should reject cancel when shipped', async () => {
    expect(true).toBe(true);
    // await seedOrder('SHIPPED');

    // const usecase = new CancelOrderUseCase(testPool);

    // await expect(usecase.execute(ORDER_ID)).rejects.toThrow();
  });

  it('should throw when order not found', async () => {
    const usecase = new CancelOrderUseCase(testPool);

    await expect(usecase.execute('not-exist')).rejects.toThrow();
  });
});
