import { describe, it, expect, vi } from 'vitest';
import { InventoryService } from '../../src/modules/inventory/domain/inventory.service.js';

describe('InventoryService', () => {
  it('should reserve stock when enough available', async () => {
    const repo = {
      findByProductId: vi.fn().mockResolvedValue({
        product_id: 'p1',
        total_stock: 10,
        reserved_stock: 2,
      }),
      reserveStock: vi.fn(),
    };

    const service = new InventoryService(repo as any);

    await service.reserveStock([{ productId: 'p1', quantity: 3 }]);

    expect(repo.reserveStock).toHaveBeenCalledWith('p1', 3);
  });

  it('should throw when stock insufficient', async () => {
    const repo = {
      findByProductId: vi.fn().mockResolvedValue({
        product_id: 'p1',
        total_stock: 5,
        reserved_stock: 5,
      }),
      reserveStock: vi.fn(),
    };

    const service = new InventoryService(repo as any);

    await expect(service.reserveStock([{ productId: 'p1', quantity: 3 }])).rejects.toThrow();
  });
});
