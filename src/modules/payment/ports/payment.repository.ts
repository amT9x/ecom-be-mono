// src/payment/domain/payment.repository.ts

import { Payment, PaymentStatus } from '../domain/payment.entity.js';

export interface PaymentRepository {
  /**
   * Persist a new payment
   */
  save(payment: Payment): Promise<void>;

  /**
   * Find payment by id
   */
  findById(id: string): Promise<Payment | null>;

  /**
   * Update payment status
   */
  updateStatus(id: string, status: PaymentStatus): Promise<void>;
}
