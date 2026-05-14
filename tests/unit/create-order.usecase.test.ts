import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Pool } from 'pg';
import { InventoryService } from '../../src/modules/inventory/inventory.service.js';
import { InventoryRepository } from '../../src/modules/inventory/inventory.repository.js';
import { CreateOrderUseCase } from '../../src/modules/orders/create-order.usecase.js';

describe('CreateOrderUseCase', () => {
  let client: any;
  let pool: any;

  let inventoryService: any;
  let orderRepo: any;

  let inventoryFactory: any;
  let orderRepoFactory: any;

  let orderUsecase: CreateOrderUseCase;

  // ⭐ Test setup
  beforeEach(() => {
    client = {
      query: vi.fn(),
      release: vi.fn(),
    };

    pool = {
      connect: vi.fn().mockResolvedValue(client),
    };

    inventoryService = {
      reserveStock: vi.fn(),
    };

    orderRepo = {
      create: vi.fn(),
      addItem: vi.fn(),
    };

    inventoryFactory = vi.fn().mockReturnValue(inventoryService);

    orderRepoFactory = vi.fn().mockReturnValue(orderRepo);

    // -----------------------
    // 5️⃣ Create usecase
    //
    // -----------------------
    orderUsecase = new CreateOrderUseCase(inventoryFactory, orderRepoFactory, pool);
  });

  it('should create order successfully', async () => {
        orderRepo.create.mockResolvedValue({ id: 'order-1' });

        const usecase = new CreateOrderUseCase(
          inventoryFactory,
          orderRepoFactory,
          pool,
        );

        const result = await usecase.execute('p1', 2);

        expect(client.query).toHaveBeenCalledWith('BEGIN');

        expect(inventoryService.reserveStock).toHaveBeenCalledWith('p1', 2);

        expect(orderRepo.create).toHaveBeenCalled();

        expect(orderRepo.addItem).toHaveBeenCalledWith('order-1', 'p1', 2);

        expect(client.query).toHaveBeenCalledWith('COMMIT');

        expect(client.release).toHaveBeenCalled();

        expect(result).toEqual({ id: 'order-1' });
  });

  it('should rollback if reserve stock fails', async () => {
    inventoryService.reserveStock.mockRejectedValue(new Error('no stock'));

    await expect(orderUsecase.execute('p1', 2)).rejects.toThrow('no stock');

    expect(client.query).toHaveBeenCalledWith('BEGIN');

    expect(client.query).toHaveBeenCalledWith('ROLLBACK');

    expect(client.release).toHaveBeenCalled();
  });

  it('should rollback if create order fails', async () => {
    orderRepo.create.mockRejectedValue(new Error('db error'));

    await expect(orderUsecase.execute('p1', 2)).rejects.toThrow('db error');

    expect(inventoryService.reserveStock).toHaveBeenCalled();

    expect(client.query).toHaveBeenCalledWith('ROLLBACK');

    expect(client.release).toHaveBeenCalled();
  });

  it('should release client', async () => {
    inventoryService.reserveStock.mockRejectedValue(new Error('boom'));

    await expect(orderUsecase.execute('p1', 2)).rejects.toThrow();

    expect(client.release).toHaveBeenCalled();
  });
});
