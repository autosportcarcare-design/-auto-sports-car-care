export type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type CreatePaymentInput = {
  orderId: string;
  amount: string;
  currency: string;
  idempotencyKey: string;
};

export type CreatePaymentResult = {
  providerReference: string;
  status: PaymentStatus;
  clientSecret?: string;
  redirectUrl?: string;
};

export type VerifiedPaymentEvent = {
  eventId: string;
  providerReference: string;
  status: PaymentStatus;
};

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  getPaymentStatus(reference: string): Promise<PaymentStatus>;
  verifyWebhook?(request: Request): Promise<VerifiedPaymentEvent>;
}
