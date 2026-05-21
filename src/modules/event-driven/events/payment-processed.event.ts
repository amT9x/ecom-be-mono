import { DomainEvent } from "../event.entity.js";

export interface PaymentProcessedEvent extends DomainEvent {
  type: 'PaymentProcessed';
  paymentId: string;
  orderId: string;
  status: 'AUTHORIZED' | 'FAILED';
}
