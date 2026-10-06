import { describe, expect, it } from "vitest";
import { assertOrderTransition } from "./state-machine";

describe("order state machine", () => {
  it("allows pending payment to paid", () => {
    expect(() =>
      assertOrderTransition("PENDING_PAYMENT", "PAID"),
    ).not.toThrow();
  });
  it("rejects skipping directly to delivered", () => {
    expect(() => assertOrderTransition("PENDING_PAYMENT", "DELIVERED")).toThrow(
      "INVALID_ORDER_TRANSITION",
    );
  });
});
