// Infrastructure Order (adapter)

import { OrderRepository } from './order.repository.js';
import { randomUUID } from 'crypto';

export class PostgresOrderRepository implements OrderRepository {
  constructor(private client: any) {}

  async create(totalAmount: number): Promise<{ id: string }> {
    const id = randomUUID();

    await this.client.query(
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
    productId: string,
    quantity: number,
    price: number,
  ): Promise<void> {
    await this.client.query(
      `
      INSERT INTO order_items(order_id, product_id, quantity. price)
      VALUES ($1,$2,$3,$4)
      `,
      [orderId, productId, quantity, price],
    );
  }
}
