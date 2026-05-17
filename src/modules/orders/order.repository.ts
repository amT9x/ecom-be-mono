import { PoolClient } from 'pg';
import { Order } from './order.entity.js';

export interface OrderRepository {
  create(totalAmount: number): Promise<{ id: string }>;

  addItem(
    orderId: string,
    productId: string,
    quantity: number,
    price: number,
  ): Promise<void>;

  findById(id: string): Promise<Order | null>;

  updateStatus(id: string, status: string, client?: PoolClient): Promise<void>;
}
