export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "READY_FOR_PICKUP"
  | "COLLECTED"
  | "CANCELLED";

const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PACKED", "READY_FOR_PICKUP", "CANCELLED"],
  PACKED: ["SHIPPED", "READY_FOR_PICKUP"],
  SHIPPED: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  READY_FOR_PICKUP: ["COLLECTED"],
  COLLECTED: [],
  CANCELLED: [],
};

export function assertOrderTransition(
  from: OrderStatus,
  to: OrderStatus,
): void {
  if (!transitions[from].includes(to))
    throw new Error("INVALID_ORDER_TRANSITION");
}
