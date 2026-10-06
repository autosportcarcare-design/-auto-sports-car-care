import { describe, it, expect } from "vitest";
import { cartItemInput, checkoutInput } from "./index";
describe("commerce input boundary", () => {
  it("rejects browser financial fields and invalid quantities", () => {
    const id = "cm123456789012345678901234";
    expect(
      cartItemInput.safeParse({ variantId: id, quantity: 1, price: "0.01" })
        .success,
    ).toBe(false);
    for (const quantity of [0, -1, 1.5, 1000])
      expect(cartItemInput.safeParse({ variantId: id, quantity }).success).toBe(
        false,
      );
  });
  it("requires checkout idempotency and valid fulfilment", () => {
    expect(
      checkoutInput.safeParse({
        addressId: "cm123456789012345678901234",
        fulfilmentMethod: "DRONE",
        idempotencyKey: "short",
      }).success,
    ).toBe(false);
  });
});
