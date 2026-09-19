import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CouponModel } from '@/lib/models/Coupon';
import { normalizeCoupon, TIER_COUPONS } from '@/lib/discount';

// Campaign coupon management for the admin dashboard. Access is gated by the
// admin session check in middleware.ts, which covers everything under
// /api/admin/.

const CODE_RE = /^[A-Z0-9]{3,20}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const RESERVED = new Set(Object.values(TIER_COUPONS).map((c) => c.code));

export async function GET() {
  await connectToDatabase();
  const coupons = await CouponModel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({
    coupons: coupons.map((c) => ({
      id: String(c._id),
      code: c.code,
      percent: c.percent,
      blurb: c.blurb ?? '',
      startsAt: c.startsAt ?? '',
      endsAt: c.endsAt ?? '',
      active: c.active,
    })),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const code = normalizeCoupon(body?.code ?? '');
  const percent = Number(body?.percent);
  const blurb: string = (body?.blurb ?? '').trim();
  const startsAt: string = (body?.startsAt ?? '').trim();
  const endsAt: string = (body?.endsAt ?? '').trim();

  if (!CODE_RE.test(code)) {
    return NextResponse.json(
      { error: 'Code must be 3–20 letters or numbers, no spaces.' },
      { status: 400 },
    );
  }
  // The tier coupons are earned by order history, not run as campaigns.
  // Letting one be redefined here would change who qualifies for it.
  if (RESERVED.has(code)) {
    return NextResponse.json(
      { error: `${code} is a built-in customer coupon and cannot be reused.` },
      { status: 400 },
    );
  }
  if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
    return NextResponse.json({ error: 'Discount must be a whole number between 1 and 100.' }, { status: 400 });
  }
  if (startsAt && !DATE_RE.test(startsAt)) {
    return NextResponse.json({ error: 'Start date must look like 2026-10-25.' }, { status: 400 });
  }
  if (endsAt && !DATE_RE.test(endsAt)) {
    return NextResponse.json({ error: 'End date must look like 2026-11-08.' }, { status: 400 });
  }
  if (startsAt && endsAt && endsAt < startsAt) {
    return NextResponse.json({ error: 'The end date cannot be before the start date.' }, { status: 400 });
  }

  await connectToDatabase();
  const existing = await CouponModel.findOne({ code });
  if (existing) {
    return NextResponse.json({ error: `${code} already exists.` }, { status: 409 });
  }

  const created = await CouponModel.create({
    code,
    percent,
    blurb,
    startsAt: startsAt || null,
    endsAt: endsAt || null,
    active: true,
  });

  return NextResponse.json({ success: true, id: String(created._id) }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const id: string = body?.id ?? '';
  if (!id) return NextResponse.json({ error: 'Missing coupon id.' }, { status: 400 });

  await connectToDatabase();
  const coupon = await CouponModel.findById(id);
  if (!coupon) return NextResponse.json({ error: 'Coupon not found.' }, { status: 404 });

  if (typeof body?.active === 'boolean') coupon.active = body.active;
  await coupon.save();

  return NextResponse.json({ success: true, active: coupon.active });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing coupon id.' }, { status: 400 });

  await connectToDatabase();
  const deleted = await CouponModel.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: 'Coupon not found.' }, { status: 404 });

  return NextResponse.json({ success: true });
}
