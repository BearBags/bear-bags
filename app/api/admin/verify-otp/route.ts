import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dataRouting } from '@/config/data-routing';
import { connectToDatabase } from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { createResetToken } from '@/lib/session';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const RESET_TOKEN_TTL_SECONDS = 10 * 60;

// A 6-digit code is only safe if it cannot be guessed at speed.
const MAX_ATTEMPTS_PER_WINDOW = 5;
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  const { allowed, retryAfterSeconds } = rateLimit(
    `admin-verify-otp:${getClientIp(request)}`,
    MAX_ATTEMPTS_PER_WINDOW,
    WINDOW_MS,
  );
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
    );
  }

  const { otp } = await request.json();
  if (!otp) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 });
  }

  await connectToDatabase();
  const admin = await Admin.findOne();

  if (
    !admin ||
    !admin.otpHash ||
    !admin.otpExpiresAt ||
    admin.otpExpiresAt.getTime() < Date.now() ||
    !(await bcrypt.compare(String(otp), admin.otpHash))
  ) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
  }

  // Single-use: clear the OTP now that it's been redeemed.
  admin.otpHash = null;
  admin.otpExpiresAt = null;
  await admin.save();

  const resetToken = await createResetToken(dataRouting.admin.recoveryEmail, RESET_TOKEN_TTL_SECONDS);
  return NextResponse.json({ resetToken });
}
