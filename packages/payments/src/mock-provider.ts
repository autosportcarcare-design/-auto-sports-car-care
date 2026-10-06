import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  PaymentStatus,
} from "./types";

export class MockPaymentProvider implements PaymentProvider {
  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    return {
      providerReference: `mock_${input.orderId}_${input.idempotencyKey.slice(0, 8)}`,
      status: "PENDING",
      redirectUrl: `/checkout/mock-pay?order=${encodeURIComponent(input.orderId)}`,
    };
  }

  async getPaymentStatus(_reference: string): Promise<PaymentStatus> {
    throw new Error("PAYMENT_STATUS_REQUIRES_DATABASE_LOOKUP");
  }
}
