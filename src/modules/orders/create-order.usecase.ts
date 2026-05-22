import { Pool } from 'pg';
import { InventoryService } from '../inventory/domain/inventory.service.js';
import { PostgresOrderRepository } from './postgres-order.repository.js';
import { PostgestInventoryRepository } from '../inventory/infrastructure/postgres-inventory.repository.js';

export interface CreateOrderInput {
  userId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    totalAmount: number;
  }[];
}

type CreateOrderOutput = {
  id: string;
  totalAmount: number;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
};

export class CreateOrderUseCase {
  constructor(
    private pool: Pool,
  ) {}

  async execute(input: CreateOrderInput): Promise<CreateOrderOutput> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // inject transaction connection
      const orderRepo = new PostgresOrderRepository(client);
      const inventoryRepo = new PostgestInventoryRepository(client);

      const inventoryService = new InventoryService(inventoryRepo);

      await inventoryService.reserveStock(
        input.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }))
      );

      const totalAmount = input.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      const order = await orderRepo.create(totalAmount);

      await orderRepo.addItem(
        order.id,
        input.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          totalAmount: item.totalAmount,
        }))
      );

      await client.query('COMMIT');

    return {
      id: order.id,
      totalAmount,
      items: input.items,
    };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}
