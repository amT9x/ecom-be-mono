import { CreatePaymentUsecase } from "../../../src/modules/payment/application/create-payment.usecase.js";
import { FakePaymentGateway } from "../../../src/modules/payment/infra/fake-payment.gateway.js";
import { PostgresPaymentRepository } from "../../../src/modules/payment/infra/postgres-payment.repository.js";

async function main() {
  console.log('=== Create Payment Flow ===');

  const repository = new PostgresPaymentRepository();
  const gateway = new FakePaymentGateway();

  const usecase = new CreatePaymentUsecase(repository, gateway);

  const result = await usecase.execute({
    paymentId: 'pay-1',
    orderId: 'order-1',
    amount: 100,
  });

  console.log('RESULT:', result);

  const payment = await repository.findById('pay-1');

  console.log('DATABASE STATE:', payment?.toJSON());
}

main();
