import { NextRequest, NextResponse } from 'next/server';
import { getDiscountPercentForEmail } from '@/lib/discount-server';
import {
  COUPON_FOR_PERCENT,
  FIRST_TIME_COUPON,
  RETURNING_COUPON,
  normalizeCoupon,
} from '@/lib/discount';

// Validates a coupon against the buyer's actual order history. The code never
// changes the price -- the first-time/returning discount is applied
// automatically at checkout either way -- so this only confirms that the code
// matches the tier this email qualifies for.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email: string = body?.email ?? '';
    const code = normalizeCoupon(body?.code ?? '');

    if (!email.trim()) {
      return NextResponse.json(
        { valid: false, error: 'Enter your email above before applying a coupon.' },
        { status: 400 },
      );
    }

    if (code !== FIRST_TIME_COUPON && code !== RETURNING_COUPON) {
      return NextResponse.json(
        { valid: false, error: 'That coupon code isn’t valid.' },
        { status: 200 },
      );
    }

    const discountPercent = await getDiscountPercentForEmail(email);
    const expectedCode = COUPON_FOR_PERCENT[discountPercent];

    if (code !== expectedCode) {
      const error =
        code === FIRST_TIME_COUPON
          ? 'WELCOME7 is for first orders only. Use BEARBAGS5 — your 5% is already applied.'
          : 'BEARBAGS5 is for returning customers. Use WELCOME7 — your 7% is already applied.';
      return NextResponse.json({ valid: false, error }, { status: 200 });
    }

    return NextResponse.json({ valid: true, code, discountPercent }, { status: 200 });
  } catch (error) {
    console.error('[coupon] failed:', error);
    return NextResponse.json({ valid: false, error: 'Could not check that coupon.' }, { status: 500 });
  }
}
