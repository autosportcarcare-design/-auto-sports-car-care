import Decimal from "decimal.js";

export type PricingLine = {
  unitPrice: string;
  quantity: number;
  taxRate: string;
};

export type PricingResult = {
  subtotal: string;
  taxTotal: string;
  shippingTotal: string;
  grandTotal: string;
};

export function calculatePricing(
  lines: PricingLine[],
  shipping = "0.00",
): PricingResult {
  let subtotal = new Decimal(0);
  let taxTotal = new Decimal(0);

  for (const line of lines) {
    if (!Number.isInteger(line.quantity) || line.quantity < 1) {
      throw new Error("INVALID_QUANTITY");
    }
    const price = new Decimal(line.unitPrice);
    const rate = new Decimal(line.taxRate);
    if (
      !price.isFinite() ||
      price.isNegative() ||
      price.decimalPlaces() > 2 ||
      !rate.isFinite() ||
      rate.lt(0) ||
      rate.gt(1)
    )
      throw new Error("INVALID_PRICE_OR_TAX");
    const lineBase = price.mul(line.quantity);
    const lineTax = lineBase
      .mul(rate)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    subtotal = subtotal.add(lineBase);
    taxTotal = taxTotal.add(lineTax);
  }

  const shippingTotal = new Decimal(shipping);
  if (
    !shippingTotal.isFinite() ||
    shippingTotal.isNegative() ||
    shippingTotal.decimalPlaces() > 2
  )
    throw new Error("INVALID_SHIPPING");
  const grandTotal = subtotal.add(taxTotal).add(shippingTotal);

  return {
    subtotal: subtotal.toFixed(2),
    taxTotal: taxTotal.toFixed(2),
    shippingTotal: shippingTotal.toFixed(2),
    grandTotal: grandTotal.toFixed(2),
  };
}
