import { Payment, PaymentStatus } from '../domain/payment.entity.js';
import { PaymentRepository } from '../ports/payment.repository.js';

export class PostgresPaymentRepository implements PaymentRepository {
  private payments = new Map<string, Payment>();

  async save(payment: Payment): Promise<void> {
    this.payments.set(payment.id, payment);
  }

  async findById(id: string): Promise<Payment | null> {
    return this.payments.get(id) ?? null;
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<void> {
    const payment = this.payments.get(id);

    if (!payment) {
      throw new Error('Payment not found');
    }

    const updated = Payment.create({
      ...payment.toJSON(),
      status,
      updatedAt: new Date(),
    });

    this.payments.set(id, updated);
  }

  async simulateProviderResult(id: string): Promise<PaymentStatus> {
    const payment = this.payments.get(id);

    if (!payment) {
      throw new Error('Payment not found');
    }

    await new Promise((r) => setTimeout(r, 300));

    const success = Math.random() > 0.2;

    const newStatus: PaymentStatus = success ? 'AUTHORIZED' : 'FAILED';

    await this.updateStatus(id, newStatus);

    return newStatus;
  }
}
