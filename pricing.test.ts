import { describe, expect, it } from "vitest";
import { calculatePricing } from "./pricing";

describe("calculatePricing", () => {
  it("calculates totals using decimal arithmetic", () => {
    expect(
      calculatePricing(
        [{ unitPrice: "145.75", quantity: 2, taxRate: "0.05" }],
        "20.00",
      ),
    ).toEqual({
      subtotal: "291.50",
      taxTotal: "14.58",
      shippingTotal: "20.00",
      grandTotal: "326.08",
    });
  });

  it("rejects invalid quantity", () => {
    expect(() =>
      calculatePricing([{ unitPrice: "10.00", quantity: 0, taxRate: "0.05" }]),
    ).toThrow("INVALID_QUANTITY");
  });
});

it("sums rounded line tax so order and invoice lines agree", () => {
  const result = calculatePricing([
    { unitPrice: "0.10", quantity: 1, taxRate: "0.05" },
    { unitPrice: "0.10", quantity: 1, taxRate: "0.05" },
  ]);
  expect(result.taxTotal).toBe("0.02");
  expect(result.grandTotal).toBe("0.22");
});
it("rejects negative, nonfinite and fractional-cent prices", () => {
  for (const price of ["-1.00", "NaN", "Infinity", "1.001"])
    expect(() =>
      calculatePricing([{ unitPrice: price, quantity: 1, taxRate: "0.05" }]),
    ).toThrow();
  expect(() => calculatePricing([], "-1.00")).toThrow();
});
