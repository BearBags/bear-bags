import { applyDiscount, findEligibleCoupon } from './discount';
import { getDiscountPercentForEmail } from './discount-server';
import { getCampaignCoupons } from './coupon-server';
import { getProductPrices } from './product-prices';

export interface CartProduct {
  id: number;
  name: string;
  price: number;
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
  /** Full price, before any coupon. */
  subtotal: number;
  shipping: number;
  total: number;
  /** 0 when no coupon is applied. */
  discountPercent: number;
  discountAmount: number;
  /** The coupon actually honoured, or null if none was applied. */
  appliedCoupon: string | null;
  /** The tier this email qualifies for, whether or not they applied it. */
  eligibleTierPercent: number;
}

// Recomputes pricing server-side from known product base prices rather than
// trusting client-sent totals.
//
// A discount applies only when the buyer actually applied a coupon they are
// eligible for. `couponCode` is re-validated here against this email's order
// history and the campaign calendar, so a client that sends a code it has not
// earned -- or one whose festival window has closed -- is simply charged full
// price rather than being trusted.
export async function computeOrderPricing(
  cartItems: CartItem[],
  email: string,
  couponCode?: string | null,
): Promise<OrderPricing> {
  const [eligibleTierPercent, campaigns, livePrices] = await Promise.all([
    getDiscountPercentForEmail(email),
    getCampaignCoupons(),
    getProductPrices(),
  ]);

  // The admin-set price, never the price the browser sent (a cart can hold a
  // stale price from before a change). Products not in the catalog fall back
  // to the client price.
  const getBasePrice = (item: CartItem): number => livePrices[item.product.id] ?? item.product.price;

  const coupon = couponCode
    ? findEligibleCoupon(couponCode, eligibleTierPercent, campaigns)
    : undefined;
  const discountPercent = coupon?.percent ?? 0;

  const pricedItems = cartItems.map((item) => ({
    ...item,
    unitPrice: applyDiscount(getBasePrice(item), discountPercent),
  }));

  // Subtotal is the full price so the summary can show the discount as its own
  // line; the saving is the difference between that and what is charged.
  const subtotal = cartItems.reduce((sum, item) => sum + getBasePrice(item) * item.quantity, 0);
  const discountedSubtotal = pricedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = 0; // free shipping on all orders
  const total = discountedSubtotal + shipping;
  const discountAmount = subtotal - discountedSubtotal;

  return {
    pricedItems,
    subtotal,
    shipping,
    total,
    discountPercent,
    discountAmount,
    appliedCoupon: coupon?.code ?? null,
    eligibleTierPercent,
  };
}
