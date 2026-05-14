export interface OrderRepository {
  create(): Promise<{ id: string }>;

  addItem(orderId: string, productId: string, quantity: number): Promise<void>;
}
