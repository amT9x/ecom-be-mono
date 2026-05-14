import { Pool } from 'pg';
import { InventoryService } from '../inventory/inventory.service.js';
import { InventoryRepository } from '../inventory/inventory.repository.js';
import { OrderRepository } from './order.repository.js';

export class CreateOrderUseCase {
  constructor(
    private inventoryServiceFactory: (client: any) => InventoryService,
    private orderRepoFactory: (client: any) => OrderRepository,
    private pool: Pool,
  ) {}

  async execute(productId: string, quantity: number) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const inventoryService = this.inventoryServiceFactory(client);

      const orderRepo = this.orderRepoFactory(client);

      await inventoryService.reserveStock(productId, quantity);

      const order = await orderRepo.create();

      await orderRepo.addItem(order.id, productId, quantity);

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
