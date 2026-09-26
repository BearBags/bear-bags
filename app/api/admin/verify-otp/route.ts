import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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
      { error: 'Too many attempts. Please wait a few minutes and try again.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
    );
  }

  const { otp } = await request.json();
  if (!otp) {
    return NextResponse.json({ error: 'Enter the 6-digit code.' }, { status: 400 });
  }

  await connectToDatabase();
  const admin = await Admin.findOne();

  if (
    !admin ||
    !admin.otpHash ||
    !admin.otpExpiresAt ||
    admin.otpExpiresAt.getTime() < Date.now() ||
    !(await bcrypt.compare(String(otp).trim(), admin.otpHash))
  ) {
    return NextResponse.json({ error: 'That code is wrong or has expired.' }, { status: 401 });
  }

  // Single-use: clear the code now that it has been redeemed.
  admin.otpHash = null;
  admin.otpExpiresAt = null;
  await admin.save();

  return NextResponse.json({ resetToken: await createResetToken(RESET_TOKEN_TTL_SECONDS) });
}
