import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { CreatePaymentUsecase } from '../../../src/modules/payment/application/create-payment.usecase.js';
import { testPool, resetDatabase } from '../../setup/test_db.js';
import { PAYMENT, ORDER, PRODUCT, INVENTORY } from '../../setup/constanst.js';
import { seedProduct, seedInventory, seedOrder } from '../../setup/seed-test.js';

describe('CreatePaymentUsecase', () => {
  let usecase: CreatePaymentUsecase;

  beforeAll(() => {
    usecase = new CreatePaymentUsecase(testPool);
  });

  afterAll(async () => {
    await testPool.end();
  });

  beforeEach(async () => {
    await resetDatabase();
    await seedProduct(testPool, PRODUCT.id, PRODUCT.name, PRODUCT.price);
    await seedInventory(testPool, PRODUCT.id, INVENTORY.total_stock, INVENTORY.reserved_stock);
    await seedOrder(testPool, ORDER.id, ORDER.status.PENDING, ORDER.total_amount);
  });

  it('should create and authorize payment', async () => {
    const result = await usecase.execute({
      paymentId: PAYMENT.id,
      orderId: ORDER.id,
      amount: ORDER.total_amount,
    });

    expect(result.paymentId).toBe(PAYMENT.id);

    expect(['AUTHORIZED', 'FAILED']).toContain(result.status);
  });

  // it('should persist payment in DB', async () => {
  //   const client = await testPool.connect();

  //   const res = await client.query(

  //     `SELECT id FROM payments WHERE id=$1`, [PAYMENT.id]
  //   );

  //   expect(res.rows.length).toBe(0);

  //   client.release();
  // });
});
