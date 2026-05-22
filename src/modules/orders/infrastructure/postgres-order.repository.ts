// Infrastructure Order (adapter)

import { OrderRepository } from '../domain/order.repository.js';
import { Order } from '../domain/order.entity.js';
import { randomUUID } from 'crypto';

export type DBExecutor = {
  query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }>;
};

export class PostgresOrderRepository implements OrderRepository {
  constructor(private readonly db: DBExecutor) {}

  async create(totalAmount: number): Promise<{ id: string }> {
    const id = randomUUID();

    await this.db.query(
      `
      INSERT INTO orders (id, total_amount)
      VALUES ($1, $2)
      `,
      [id, totalAmount],
    );

    return { id };
  }

  async addItem(
    orderId: string,
    items: { productId: string; quantity: number; price: number }[],
  ): Promise<void> {
    for (const item of items) {
      await this.db.query(
        `
        INSERT INTO order_items(order_id, product_id, quantity, price)
        VALUES ($1,$2,$3,$4)
        `,
        [orderId, item.productId, item.quantity, item.price],
      );
    }
  }

  async findById(id: string): Promise<Order | null> {
    const result = await this.db.query(
      `
      SELECT *
      FROM orders
      WHERE id = $1
      `,
      [id],
    );

    return result.rows[0] ?? null;
  }

  async updateStatus(id: string, status: string) {
    await this.db.query(
      `
      UPDATE orders
      SET status = $1
      WHERE id = $2
      `,
      [status, id],
    );
  }
}
