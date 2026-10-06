export const permissions = [
  "PRODUCT_VIEW",
  "PRODUCT_CREATE",
  "PRODUCT_EDIT",
  "PRODUCT_DELETE",
  "PRICE_VIEW",
  "PRICE_EDIT",
  "INVENTORY_VIEW",
  "INVENTORY_ADJUST",
  "BRAND_VIEW",
  "BRAND_EDIT",
  "CATEGORY_VIEW",
  "CATEGORY_EDIT",
  "ORDER_VIEW",
  "ORDER_EDIT",
  "ORDER_STATUS_EDIT",
  "PAYMENT_VIEW",
  "REFUND_CREATE",
  "CUSTOMER_VIEW",
  "CUSTOMER_EDIT",
  "SUPPORT_VIEW",
  "SUPPORT_MANAGE",
  "MEDIA_MANAGE",
  "REPORT_VIEW",
  "AI_KNOWLEDGE_VIEW",
  "AI_KNOWLEDGE_EDIT",
  "STAFF_MANAGE",
  "ROLE_MANAGE",
  "PERMISSION_MANAGE",
  "AUDIT_VIEW",
  "INTEGRATION_MANAGE",
  "SITE_SETTINGS",
  "ADMIN_SETTINGS",
] as const;

export type Permission = (typeof permissions)[number];
export type AppRole = "CUSTOMER" | "STAFF" | "ADMIN" | "SUPER_ADMIN";

const adminPermissions = new Set<Permission>([
  "PRODUCT_VIEW",
  "PRODUCT_CREATE",
  "PRODUCT_EDIT",
  "PRICE_VIEW",
  "PRICE_EDIT",
  "INVENTORY_VIEW",
  "INVENTORY_ADJUST",
  "BRAND_VIEW",
  "BRAND_EDIT",
  "CATEGORY_VIEW",
  "CATEGORY_EDIT",
  "ORDER_VIEW",
  "ORDER_EDIT",
  "ORDER_STATUS_EDIT",
  "PAYMENT_VIEW",
  "CUSTOMER_VIEW",
  "SUPPORT_VIEW",
  "SUPPORT_MANAGE",
  "MEDIA_MANAGE",
  "REPORT_VIEW",
  "SITE_SETTINGS",
]);

export function hasPermission(role: AppRole, permission: Permission): boolean {
  if (role === "SUPER_ADMIN") return true;
  if (role === "ADMIN") return adminPermissions.has(permission);
  if (role === "STAFF")
    return [
      "PRODUCT_VIEW",
      "ORDER_VIEW",
      "CUSTOMER_VIEW",
      "SUPPORT_VIEW",
    ].includes(permission);
  return false;
}

export function assertPermission(role: AppRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error("FORBIDDEN");
  }
}
