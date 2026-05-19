import { ConfirmOrderUseCase } from '../../../orders/confirm-order.usecase.js';

export class PaymentProcessedHandler {
  constructor(private confirmOrder: ConfirmOrderUseCase) {}

  async handle(event: any) {
    if (event.type !== 'PaymentProcessed') return;

    if (event.status === 'AUTHORIZED') {
      await this.confirmOrder.execute(event.orderId);
    }
  }
}
