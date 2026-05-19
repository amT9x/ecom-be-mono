import assert from 'node:assert';
import { CreatePaymentUsecase } from '../create-payment.usecase.js';
import { FakePaymentGateway } from '../../infra/fake-payment.gateway.js';
import { PostgresPaymentRepository } from '../../infra/postgres-payment.repository.js';

async function testCreatePayment() {
  const repo = new PostgresPaymentRepository();
  const gateway = new FakePaymentGateway();

  const usecase = new CreatePaymentUsecase(repo, gateway);

  const result = await usecase.execute({
    paymentId: 'pay-test',
    orderId: 'order-test',
    amount: 50,
  });

  assert.ok(result.paymentId);
  assert.ok(['AUTHORIZED', 'FAILED'].includes(result.status));

  const payment = await repo.findById('pay-test');

  assert.equal(payment?.id, 'pay-test');
  assert.equal(payment?.orderId, 'order-test');

  console.log('✅ create payment test passed');
}

testCreatePayment();
