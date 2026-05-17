import { Pool } from 'pg';
import { InventoryService } from '../inventory/inventory.service.js';
import { PostgresOrderRepository } from './postgres-order.repository.js';
import { PostgestInventoryRepository } from '../inventory/postgres-inventory.repository.js';

export class CreateOrderUseCase {
  constructor(
    private pool: Pool,
  ) {}

  async execute(productId: string, quantity: number, price: number) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // inject transaction connection
      const orderRepo = new PostgresOrderRepository(client);
      const inventoryRepo = new PostgestInventoryRepository(client);

      const inventoryService = new InventoryService(inventoryRepo);

      await inventoryService.reserveStock(productId, quantity);

      const order = await orderRepo.create(0);

      await orderRepo.addItem(order.id, productId, quantity, price);

      await client.query('COMMIT');

      return order;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}
