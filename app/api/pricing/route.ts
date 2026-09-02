import { NextRequest, NextResponse } from 'next/server';
import { computeOrderPricing, type CartItem } from '@/lib/order-pricing';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// Read-only preview of what this cart will actually cost this email. The
// checkout summary renders from this rather than from the cart's own prices,
// which carry a localStorage-based guess of the discount tier made when the
// item was added and can disagree with the server's order-history lookup.
const MAX_LOOKUPS_PER_WINDOW = 30;
const WINDOW_MS = 60_000;

export async function POST(request: NextRequest) {
  try {
    const { allowed, retryAfterSeconds } = rateLimit(
      `pricing:${getClientIp(request)}`,
      MAX_LOOKUPS_PER_WINDOW,
      WINDOW_MS,
    );
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
      );
    }

    const body = await request.json();
    const email: string = body?.email ?? '';
    const cartItems: CartItem[] = body?.cartItems ?? [];

    if (!email.trim() || cartItems.length === 0) {
      return NextResponse.json({ error: 'Email and cart items are required' }, { status: 400 });
    }

    const pricing = await computeOrderPricing(cartItems, email);

    return NextResponse.json({
      subtotal: pricing.subtotal,
      shipping: pricing.shipping,
      total: pricing.total,
      discountPercent: pricing.discountPercent,
      discountAmount: pricing.discountAmount,
    });
  } catch (error) {
    console.error('[pricing] failed:', error);
    return NextResponse.json({ error: 'Could not calculate pricing' }, { status: 500 });
  }
}
