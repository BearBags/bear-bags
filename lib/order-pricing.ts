import { applyDiscount } from './discount';
import { getDiscountPercentForEmail } from './discount-server';
import { getProductById } from './products';
import type { PurchaseType } from '@/config/data-routing';

export interface CartProduct {
  id: number;
  name: string;
  price: number;
  option?: PurchaseType;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

export interface OrderFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  paymentMethod: string;
}

export interface PricedItem extends CartItem {
  unitPrice: number;
}

export interface OrderPricing {
  pricedItems: PricedItem[];
  subtotal: number;
  shipping: number;
  total: number;
  discountPercent: number;
  discountAmount: number;
  hasSubscription: boolean;
}

const getBasePrice = (item: CartItem): number => {
  const product = getProductById(item.product.id);
  if (!product) return item.product.price; // fallback for products not in the catalog
  return item.product.option === 'subscribe' ? Math.round(product.price * 0.9) : product.price;
};

// Recomputes pricing server-side from known product base prices rather than
// trusting client-sent totals, and applies the authoritative first-time (7%)
// vs returning-customer (5%) discount based on this email's order history.
export async function computeOrderPricing(cartItems: CartItem[], email: string): Promise<OrderPricing> {
  const discountPercent = await getDiscountPercentForEmail(email);
  const hasSubscription = cartItems.some((item) => item.product.option === 'subscribe');

  const pricedItems = cartItems.map((item) => ({
    ...item,
    unitPrice: applyDiscount(getBasePrice(item), discountPercent),
  }));

  const subtotal = pricedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = 0; // free shipping on all orders
  const total = subtotal + shipping;
  const discountAmount = pricedItems.reduce(
    (sum, item) => sum + (getBasePrice(item) - item.unitPrice) * item.quantity,
    0,
  );

  return { pricedItems, subtotal, shipping, total, discountPercent, discountAmount, hasSubscription };
}
