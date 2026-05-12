import { Pool } from 'pg';
import { InventoryRepository } from './inventory.repository.js';
import { NotFoundError } from '../../shared/errors/http-error.js';

export class InventoryService {
  constructor(private readonly pool: Pool) {}

  async checkAvailableStock(
    productId: string,
    quantity: number,
  ): Promise<boolean> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const repo = new InventoryRepository(client);

      const inventory = await repo.findByProductId(productId);

      if (!inventory) {
        throw new NotFoundError('Inventory not found');
      }

      const available = inventory.total_stock - inventory.reserved_stock;

      await client.query('COMMIT');

      return available >= quantity;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async reserveStock(productId: string, quantity: number): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const repo = new InventoryRepository(client);

      const inventory = await repo.findByProductId(productId);

      if (!inventory) {
        throw new NotFoundError('Inventory not found');
      }

      const available = inventory.total_stock - inventory.reserved_stock;

      if (available < quantity) {
        throw new Error('Insufficient stock');
      }

      await repo.reserveStock(productId, quantity);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async releaseStock(productId: string, quantity: number): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const repo = new InventoryRepository(client);

      await repo.releaseStock(productId, quantity);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async deductStock(productId: string, quantity: number): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const repo = new InventoryRepository(client);

      const inventory = await repo.findByProductId(productId);

      if (!inventory) {
        throw new NotFoundError('Inventory not found');
      }

      if (inventory.reserved_stock < quantity) {
        throw new Error('Invalid deduction');
      }

      await repo.deductStock(productId, quantity);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
