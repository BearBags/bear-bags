import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { dataRouting } from '@/config/data-routing';
import { connectToDatabase } from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { sendOtpEmail } from '@/lib/mailer';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const OTP_TTL_MS = 10 * 60 * 1000;

// Each request sends an email to the business inbox, so cap it per IP to stop
// the button being used to flood hello@bearbags.in.
const MAX_REQUESTS_PER_WINDOW = 3;
const WINDOW_MS = 15 * 60 * 1000;

// The code always goes to the fixed recovery address -- the caller does not
// supply one.
export async function POST(request: NextRequest) {
  const { allowed, retryAfterSeconds } = rateLimit(
    `admin-forgot:${getClientIp(request)}`,
    MAX_REQUESTS_PER_WINDOW,
    WINDOW_MS,
  );
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
    );
  }

  await connectToDatabase();
  const admin = await Admin.findOne();
  if (!admin) {
    return NextResponse.json({ error: 'No admin account found' }, { status: 404 });
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  admin.otpHash = await bcrypt.hash(otp, 10);
  admin.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  await admin.save();
  await sendOtpEmail(dataRouting.admin.recoveryEmail, otp);

  return NextResponse.json({ success: true });
}
