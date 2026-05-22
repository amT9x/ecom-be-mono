import { InventoryRepository, InventoryRow } from '../inventory.repository.js';

export type DBExecutor = {
  query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }>;
};

export class PostgestInventoryRepository implements InventoryRepository {
  constructor(private readonly db: DBExecutor) {}

  async findByProductId(productId: string): Promise<InventoryRow | null> {
    const result = await this.db.query<InventoryRow>(
      `
      SELECT product_id, total_stock, reserved_stock
      FROM inventory
      WHERE product_id = $1
      FOR UPDATE
      `,
      [productId],
    );

    return result.rows[0] ?? null;
  }

  async reserveStock(productId: string, quantity: number): Promise<void> {
    await this.db.query(
      `
      UPDATE inventory
      SET reserved_stock = reserved_stock + $1,
          updated_at = NOW()
      WHERE product_id = $2
      `,
      [quantity, productId],
    );
  }

  async releaseStock(productId: string, quantity: number): Promise<void> {
    await this.db.query(
      `
      UPDATE inventory
      SET reserved_stock = reserved_stock - $1,
          updated_at = NOW()
      WHERE product_id = $2
      `,
      [quantity, productId],
    );
  }

  async deductStock(productId: string, quantity: number): Promise<void> {
    await this.db.query(
      `
      UPDATE inventory
      SET total_stock = total_stock - $1,
          reserved_stock = reserved_stock - $1,
          updated_at = NOW()
      WHERE product_id = $2
      `,
      [quantity, productId],
    );
  }
}
