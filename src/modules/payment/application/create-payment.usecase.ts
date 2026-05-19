import { Pool } from 'pg';

import { Payment } from '../domain/payment.entity.js';
import { PostgresPaymentRepository } from '../infra/postgres-payment.repository.js';
import { FakePaymentGateway } from '../infra/fake-payment.gateway.js';

export interface CreatePaymentInput {
  paymentId: string;
  orderId: string;
  amount: number;
}

export type CreatePaymentOutput = {
  paymentId: string;
  status: string;
};

export class CreatePaymentUsecase {
  constructor(private pool: Pool) {}

  async execute(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const paymentRepository = new PostgresPaymentRepository(client);

      const paymentGateway = new FakePaymentGateway();

      const payment = Payment.create({
        id: input.paymentId,
        orderId: input.orderId,
        amount: input.amount,
        status: 'PENDING',
        provider: 'FAKE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await paymentRepository.save(payment);

      const result = await paymentGateway.charge(payment.id);

      await paymentRepository.updateStatus(payment.id, result);

      await client.query('COMMIT');

      console.log('[EVENT] PaymentProcessed', {
        paymentId: payment.id,
        orderId: payment.orderId,
        status: result,
      });

      return {
        paymentId: payment.id,
        status: result,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
