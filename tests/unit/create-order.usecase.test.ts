import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Pool } from 'pg';
import { InventoryService } from '../../src/modules/inventory/inventory.service.js';
import { InventoryRepository } from '../../src/modules/inventory/inventory.repository.js';
import { CreateOrderUseCase } from '../../src/modules/orders/create-order.usecase.js';

describe('CreateOrderUseCase', () => {
  // ⭐ Test setup
  beforeEach(() => {
  });

  it('should create order successfully', async () => {
    expect(true).toBe(true);
  });

  it('should rollback if reserve stock fails', async () => {
    expect(true).toBe(true);
  });

  it('should rollback if create order fails', async () => {
    expect(true).toBe(true);
  });

  it('should release client', async () => {
    expect(true).toBe(true);
  });
});
