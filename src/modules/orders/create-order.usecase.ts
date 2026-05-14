import { Pool } from 'pg';
import { InventoryService } from '../inventory/inventory.service.js';
import { InventoryRepository } from '../inventory/inventory.repository.js';
// import { OrderRepository } from './order/order.repository.js';

// export class CreateOrderUseCase {
//   constructor(
//     private inventoryService: InventoryService,
//     private orderRepo: OrderRepository,
//     private pool: Pool,
//   ) {}

//   async execute(productId: string, quantity: number) {
//     const client = await this.pool.connect();

//     try {
//       await client.query('BEGIN');

//       // IMPORTANT: recreate repo with trx client
//       const inventoryRepo = new InventoryRepository(client);
//       const inventoryService = new InventoryService(inventoryRepo);

//       const orderRepo = new OrderRepository(client);

//       // 1. reserve stock
//       await inventoryService.reserveStock(productId, quantity);

//       // 2. create order
//       const order = await orderRepo.create();

//       // 3. create order item
//       await orderRepo.addItem(order.id, productId, quantity);

//       await client.query('COMMIT');

//       return order;
//     } catch (e) {
//       await client.query('ROLLBACK');
//       throw e;
//     } finally {
//       client.release();
//     }
//   }
// }
