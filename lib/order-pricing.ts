import { applyDiscount, findEligibleCoupon } from './discount';
import { getDiscountPercentForEmail } from './discount-server';
import { getCampaignCoupons } from './coupon-server';
import { getProductPrices } from './product-prices';
import { getProductById } from './products';

const MAX_QUANTITY_PER_ITEM = 1000;
// Also keeps the cart small enough to fit in a Razorpay order note (256 chars).
const MAX_CART_LINES = 10;

/** The cart itself is malformed; routes answer 400 with this message. */
export class InvalidCartError extends Error {}

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
//
// Only catalog products and whole, positive quantities are accepted. Anything
// else throws InvalidCartError -- an unknown product id must never fall back to
// a price the browser sent.
export async function computeOrderPricing(
  cartItems: CartItem[],
  email: string,
  couponCode?: string | null,
): Promise<OrderPricing> {
  const items = validateCart(cartItems);

  const [eligibleTierPercent, campaigns, livePrices] = await Promise.all([
    getDiscountPercentForEmail(email),
    getCampaignCoupons(),
    getProductPrices(),
  ]);

  // The admin-set price, never the price the browser sent (a cart can hold a
  // stale price from before a change).
  const getBasePrice = (item: CartItem): number => livePrices[item.product.id];

  const coupon = couponCode
    ? findEligibleCoupon(couponCode, eligibleTierPercent, campaigns)
    : undefined;
  const discountPercent = coupon?.percent ?? 0;

  const pricedItems = items.map((item) => ({
    ...item,
    product: { ...item.product, price: getBasePrice(item) },
    unitPrice: applyDiscount(getBasePrice(item), discountPercent),
  }));

  // Subtotal is the full price so the summary can show the discount as its own
  // line; the saving is the difference between that and what is charged.
  const subtotal = items.reduce((sum, item) => sum + getBasePrice(item) * item.quantity, 0);
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

// Rebuilds each line from the catalog, keeping only the product id and
// quantity from the client, so the name stored on the order is ours too.
function validateCart(cartItems: unknown): CartItem[] {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new InvalidCartError('Your cart is empty.');
  }
  if (cartItems.length > MAX_CART_LINES) {
    throw new InvalidCartError('Too many items in the cart.');
  }
  return cartItems.map((item) => {
    const product = getProductById(Number(item?.product?.id));
    const quantity = item?.quantity;
    if (!product) {
      throw new InvalidCartError('Your cart has a product that is no longer available.');
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
      throw new InvalidCartError(`Quantity must be a whole number between 1 and ${MAX_QUANTITY_PER_ITEM}.`);
    }
    return { product: { id: product.id, name: product.title, price: product.price }, quantity };
  });
}

// The Razorpay order carries the exact pricing it was created with, so the
// verify step records what was actually paid for rather than re-reading a cart
// from the browser (which could swap in more items after paying for fewer).
// Notes are written only by our server with the secret key, so they cannot be
// tampered with. Each value must stay under Razorpay's 256-character limit.
export function pricingToOrderNotes(pricing: OrderPricing, email: string): Record<string, string> {
  return {
    email: email.trim().toLowerCase(),
    coupon: pricing.appliedCoupon ?? '',
    discountPercent: String(pricing.discountPercent),
    // id:quantity:basePrice:unitPrice per line
    items: pricing.pricedItems
      .map((item) => `${item.product.id}:${item.quantity}:${item.product.price}:${item.unitPrice}`)
      .join(','),
  };
}

export function pricingFromOrderNotes(
  notes: Record<string, string | number> | undefined,
): { pricing: OrderPricing; email: string } | null {
  if (!notes || typeof notes.items !== 'string' || typeof notes.email !== 'string' || !notes.items) return null;

  const pricedItems: PricedItem[] = [];
  let subtotal = 0;
  for (const line of notes.items.split(',')) {
    const [id, quantity, basePrice, unitPrice] = line.split(':').map(Number);
    const product = getProductById(id);
    if (!product || ![quantity, basePrice, unitPrice].every(Number.isInteger)) return null;
    pricedItems.push({ product: { id, name: product.title, price: basePrice }, quantity, unitPrice });
    subtotal += basePrice * quantity;
  }

  const total = pricedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  return {
    email: notes.email,
    pricing: {
      pricedItems,
      subtotal,
      shipping: 0,
      total,
      discountPercent: Number(notes.discountPercent) || 0,
      discountAmount: subtotal - total,
      appliedCoupon: typeof notes.coupon === 'string' && notes.coupon ? notes.coupon : null,
      // Not needed once the order is paid; the tier only matters before checkout.
      eligibleTierPercent: 0,
    },
  };
}
