import { NextRequest, NextResponse } from 'next/server';
import { getDiscountPercentForEmail } from '@/lib/discount-server';
import { computeOrderPricing, type CartItem } from '@/lib/order-pricing';
import {
  couponExists,
  findEligibleCoupon,
  normalizeCoupon,
  TIER_COUPONS,
  FIRST_TIME_COUPON,
  RETURNING_COUPON,
  FIRST_TIME_DISCOUNT_PERCENT,
} from '@/lib/discount';
import { getCampaignCoupons } from '@/lib/coupon-server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// Applies a coupon to this cart. The code is checked against the buyer's own
// eligibility -- their order-history tier, or a campaign's active window -- and
// the resulting saving is returned so checkout can show what they earned.
const MAX_ATTEMPTS_PER_WINDOW = 20;
const WINDOW_MS = 60_000;

export async function POST(request: NextRequest) {
  try {
    const { allowed, retryAfterSeconds } = rateLimit(
      `coupon:${getClientIp(request)}`,
      MAX_ATTEMPTS_PER_WINDOW,
      WINDOW_MS,
    );
    if (!allowed) {
      return NextResponse.json(
        { valid: false, error: 'Too many attempts. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
      );
    }

    const body = await request.json();
    const email: string = body?.email ?? '';
    const cartItems: CartItem[] = body?.cartItems ?? [];
    const code = normalizeCoupon(body?.code ?? '');

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Enter a coupon code.' }, { status: 400 });
    }

    if (!email.trim()) {
      return NextResponse.json(
        { valid: false, error: 'Enter your email above before applying a coupon.' },
        { status: 400 },
      );
    }

    const campaigns = await getCampaignCoupons();

    if (!couponExists(code, campaigns)) {
      return NextResponse.json(
        { valid: false, error: 'That coupon code isn’t valid.' },
        { status: 200 },
      );
    }

    const tierPercent = await getDiscountPercentForEmail(email);
    const coupon = findEligibleCoupon(code, tierPercent, campaigns);

    if (!coupon) {
      // The code is real but not for this buyer: either the wrong history tier,
      // or a campaign that is not running right now.
      const theirTier = TIER_COUPONS[tierPercent];
      let error = 'That coupon isn’t available on this order.';
      if (code === FIRST_TIME_COUPON) {
        error = `${FIRST_TIME_COUPON} is for first orders only. Use ${RETURNING_COUPON} for ${tierPercent}% off.`;
      } else if (code === RETURNING_COUPON) {
        error = `${RETURNING_COUPON} is for returning customers. Use ${FIRST_TIME_COUPON} for ${FIRST_TIME_DISCOUNT_PERCENT}% off your first order.`;
      } else if (theirTier) {
        error = `That offer has ended. Use ${theirTier.code} for ${theirTier.percent}% off.`;
      }
      return NextResponse.json({ valid: false, error }, { status: 200 });
    }

    // Price the cart with the coupon so the response can state the exact saving.
    const pricing = cartItems.length
      ? await computeOrderPricing(cartItems, email, coupon.code)
      : null;

    return NextResponse.json(
      {
        valid: true,
        code: coupon.code,
        discountPercent: coupon.percent,
        discountAmount: pricing?.discountAmount ?? 0,
        subtotal: pricing?.subtotal ?? 0,
        total: pricing?.total ?? 0,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[coupon] failed:', error);
    return NextResponse.json({ valid: false, error: 'Could not check that coupon.' }, { status: 500 });
  }
}
