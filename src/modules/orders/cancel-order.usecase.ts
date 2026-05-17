import { Pool } from 'pg';
import { NotFoundError } from '../../shared/errors/http-error.js';
import { PostgresOrderRepository } from './postgres-order.repository.js';

export class CancelOrderUseCase {
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

      if (
        order.status !== 'PENDING' &&
        order.status !== 'CONFIRMED'
      ) {
        throw new Error('Order cannot be cancelled');
      }

      // future:
      // await inventoryService.release(order.items)
      // await paymentService.refund(order.paymentId)

      await orderRepo.updateStatus(orderId, 'CANCELLED');

      await client.query('COMMIT');

      return { status: 'CANCELLED' };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
