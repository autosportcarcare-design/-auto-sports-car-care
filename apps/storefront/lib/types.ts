export interface Variant {
  id: string;
  sku: string;
  title: string;
  price: string;
  basicAvailability: number;
  reservedQuantity: number;
  taxClass: { rate: string };
}
export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  longDescription: string | null;
  brand: { name: string; slug: string };
  category: { name: string; slug: string };
  media: Array<{ url: string; altText: string; type: string }>;
  variants: Variant[];
}
export interface CartData {
  id: string;
  items: Array<{ quantity: number; variant: Variant & { product: Product } }>;
  totals: {
    subtotal: string;
    taxTotal: string;
    shippingTotal: string;
    grandTotal: string;
  };
}
export interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  grandTotal: string;
  createdAt: string;
  items: Array<{
    productNameSnapshot: string;
    variantNameSnapshot: string;
    quantity: number;
    lineTotal: string;
  }>;
}
export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
}
