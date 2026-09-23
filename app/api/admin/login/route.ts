import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dataRouting } from '@/config/data-routing';
import { connectToDatabase } from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { createSessionToken } from '@/lib/session';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// This endpoint guards the whole dashboard and the only credential is a
// password, so failed attempts are capped per IP to make guessing impractical.
// Deliberately tighter than the coupon/pricing limits: a real admin needs a
// handful of tries, an attacker needs thousands.
const MAX_ATTEMPTS_PER_WINDOW = 5;
const WINDOW_MS = 300_000; // 5 minutes

// One-time migration: the admin used to be a single password in ADMIN_PASSWORD.
// If no Admin document exists yet, seed one from ADMIN_PASSWORD so existing
// deployments keep working without a manual migration step.
async function seedAdminIfMissing() {
  const existing = await Admin.findOne();
  if (existing) return;

  const { ADMIN_PASSWORD } = process.env;
  if (!ADMIN_PASSWORD) return;

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await Admin.create({ email: dataRouting.admin.email, passwordHash });
}

export async function POST(request: NextRequest) {
  const { allowed, retryAfterSeconds } = rateLimit(
    `admin-login:${getClientIp(request)}`,
    MAX_ATTEMPTS_PER_WINDOW,
    WINDOW_MS,
  );
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
    );
  }

  const { password } = await request.json();
  if (!password) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  await connectToDatabase();
  await seedAdminIfMissing();

  const admin = await Admin.findOne();
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = await createSessionToken(dataRouting.admin.sessionMaxAgeSeconds);

  const response = NextResponse.json({ success: true });
  response.cookies.set(dataRouting.admin.sessionCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: dataRouting.admin.sessionMaxAgeSeconds,
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(dataRouting.admin.sessionCookieName);
  return response;
}
