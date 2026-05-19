import { PoolClient } from 'pg';
import { Payment, PaymentStatus } from '../domain/payment.entity.js';
import { PaymentRepository } from '../ports/payment.repository.js';

export type DBExecutor = {
  query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }>;
};

export class PostgresPaymentRepository implements PaymentRepository {
  constructor(private db: DBExecutor) {}

  async save(payment: Payment): Promise<void> {
    await this.db.query(
      `
      INSERT INTO payments
      (id, order_id, amount, status, provider, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      `,
      [
        payment.id,
        payment.orderId,
        payment.amount,
        payment.status,
        payment.provider,
        payment.createdAt,
        payment.updatedAt,
      ],
    );
  }

  async findById(id: string): Promise<Payment | null> {
    const res = await this.db.query(`SELECT * FROM payments WHERE id=$1`, [id]);

    if (!res.rows.length) return null;

    return Payment.create({
      id: res.rows[0].id,
      orderId: res.rows[0].order_id,
      amount: res.rows[0].amount,
      status: res.rows[0].status,
      provider: res.rows[0].provider,
      createdAt: res.rows[0].created_at,
      updatedAt: res.rows[0].updated_at,
    });
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<void> {
    await this.db.query(
      `
      UPDATE payments
      SET status=$2, updated_at=NOW()
      WHERE id=$1
      `,
      [id, status],
    );
  }
}
