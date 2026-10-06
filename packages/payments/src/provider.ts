import { MockPaymentProvider } from "./mock-provider";
import type { PaymentProvider } from "./types";

export function getPaymentProvider(): PaymentProvider {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.ENABLE_TEST_PAYMENTS !== "true"
  )
    throw new Error("PAYMENT_PROVIDER_NOT_CONFIGURED");
  const configured = process.env.PAYMENT_PROVIDER ?? "mock";
  if (configured === "mock") return new MockPaymentProvider();

  // Stripe production implementation intentionally waits for provider credentials.
  // The contract stays stable so checkout/order services do not change.
  if (configured === "stripe") {
    throw new Error("STRIPE_PROVIDER_NOT_CONFIGURED");
  }

  throw new Error("UNKNOWN_PAYMENT_PROVIDER");
}
