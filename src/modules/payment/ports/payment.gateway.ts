export type PaymentGatewayResult = 'AUTHORIZED' | 'FAILED';

export interface PaymentGateway {
  charge(paymentId: string): Promise<PaymentGatewayResult>;
}
