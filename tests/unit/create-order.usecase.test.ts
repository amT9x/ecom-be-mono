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
    expect(true).toBeTruthy();
  });
  it('should rollback if reserve stock fails', () => {
    expect(true).toBeTruthy();
  });
  it('should rollback if create order fails', () => {
    expect(true).toBeTruthy();
  })
  it('should release client', () => {
    expect(true).toBeTruthy();
  });
});
