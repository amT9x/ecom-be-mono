import { Pool } from 'pg';
import { NotFoundError } from '../../../shared/errors/http-error.js';
import { PostgresOrderRepository } from '../infrastructure/postgres-order.repository.js';

export class ConfirmOrderUseCase {
  constructor(
    private pool: Pool,
  ) {}

  async execute(orderId: string) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const orderRepo = new PostgresOrderRepository(client);

      const order = await orderRepo.findById(orderId);

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      if (order.status !== 'PENDING') {
        throw new Error('Invalid order status');
      }

      // const confirmed = this.orderService.confirm(order);

      await orderRepo.updateStatus(orderId, 'CONFIRMED');

      await client.query('COMMIT');

      return {status: 'CONFIRMED'};
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
