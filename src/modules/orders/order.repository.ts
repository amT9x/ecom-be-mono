export interface OrderRepository {
  create(totalAmount: number): Promise<{ id: string }>;

  addItem(orderId: string, productId: string, quantity: number, price: number): Promise<void>;
}
