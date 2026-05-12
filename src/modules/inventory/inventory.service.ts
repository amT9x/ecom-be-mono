import { InventoryRepository } from './inventory.repository.js';
import { NotFoundError } from '../../shared/errors/http-error.js';

export class InventoryService {
  constructor(private repo: InventoryRepository) {}

  async checkAvailableStock(productId: string, quantity: number) {
    const inventory = await this.repo.findByProductId(productId);

    if (!inventory) {
      throw new NotFoundError('Inventory not found');
    }

    const available = inventory.total_stock - inventory.reserved_stock;

    return available >= quantity;
  }

  async reserveStock(productId: string, quantity: number) {
    const inventory = await this.repo.findByProductId(productId);

    if (!inventory) {
      throw new NotFoundError('Inventory not found');
    }

    const available = inventory.total_stock - inventory.reserved_stock;

    if (available < quantity) {
      throw new Error('Insufficient stock');
    }

    await this.repo.reserveStock(productId, quantity);
  }

  async releaseStock(productId: string, quantity: number) {
    await this.repo.releaseStock(productId, quantity);
  }

  async deductStock(productId: string, quantity: number) {
    const inventory = await this.repo.findByProductId(productId);

    if (!inventory) {
      throw new NotFoundError('Inventory not found');
    }

    if (inventory.reserved_stock < quantity) {
      throw new Error('Invalid deduction');
    }

    await this.repo.deductStock(productId, quantity);
  }
}
