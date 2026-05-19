import { Payment } from '../domain/payment.entity.js';
import { PaymentGateway } from '../ports/payment.gateway.js';
import { PaymentRepository } from '../ports/payment.repository.js';

export interface CreatePaymentInput {
  paymentId: string;
  orderId: string;
  amount: number;
}

export class CreatePaymentUsecase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(input: CreatePaymentInput) {
    const payment = Payment.create({
      id: input.paymentId,
      orderId: input.orderId,
      amount: input.amount,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.paymentRepository.save(payment);

    const result = await this.paymentGateway.charge(payment.id);

    await this.paymentRepository.updateStatus(payment.id, result);

    console.log('[EVENT] PaymentProcessed', {
      paymentId: payment.id,
      orderId: payment.orderId,
      status: result,
    });

    return {
      paymentId: payment.id,
      status: result,
    };
  }
}
