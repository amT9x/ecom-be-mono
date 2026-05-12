import { PoolClient } from "pg";

export interface InventoryRow {
  product_id: string;
  total_stock: number;
  reserved_stock: number;
}

export class InventoryRepository {
  constructor(private readonly db: PoolClient) {}

  async findByProductId(productId: string): Promise<InventoryRow | null> {
    const result = await this.db.query(
      `
      SELECT product_id, total_stock, reserved_stock
      FROM inventory
      WHERE product_id = $1
      FOR UPDATE
      `,
      [productId]
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
      [quantity, productId]
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
      [quantity, productId]
    );
  }

  async deductStock(productId: string, quantity: number): Promise<void> {
    await this.db.query(
      `
      UPDATE inventory
      SET
        total_stock = total_stock - $1,
        reserved_stock = reserved_stock - $1,
        updated_at = NOW()
      WHERE product_id = $2
      `,
      [quantity, productId]
    );
  }
}
