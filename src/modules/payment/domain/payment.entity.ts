export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'CANCELLED';

export interface IPayment {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Payment {
  private props: IPayment;

  private constructor(props: IPayment) {
    this.props = props;
  }

  static create(props: IPayment): Payment {
    return new Payment(props);
  }

  get id(): string {
    return this.props.id;
  }

  get orderId(): string {
    return this.props.orderId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get status(): PaymentStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON(): IPayment {
    return { ...this.props };
  }
}
