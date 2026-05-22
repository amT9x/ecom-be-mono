export interface InventoryRepository {
  findByProductId(productId: string): Promise<InventoryRow | null>;
  reserveStock(productId: string, quantity: number): Promise<void>;
  releaseStock(productId: string, quantity: number): Promise<void>;
  deductStock(productId: string, quantity: number): Promise<void>;
}

export interface InventoryRow {
  product_id: string;
  total_stock: number;
  reserved_stock: number;
}
