// Fake Stripe

import { PaymentGateway } from '../ports/payment.gateway.js';

export class FakePaymentGateway implements PaymentGateway {
  async charge(paymentId: string) {
    await new Promise((r) => setTimeout(r, 300));

    return Math.random() > 0.2 ? 'AUTHORIZED' : 'FAILED';
  }
}
