import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { createResetToken } from '@/lib/session';

const RESET_TOKEN_TTL_SECONDS = 10 * 60;

export async function POST(request: NextRequest) {
  const { email, otp } = await request.json();
  if (!email || !otp) {
    return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
  }

  await connectToDatabase();
  const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });

  if (
    !admin ||
    !admin.otpHash ||
    !admin.otpExpiresAt ||
    admin.otpExpiresAt.getTime() < Date.now() ||
    !(await bcrypt.compare(otp, admin.otpHash))
  ) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
  }

  // Single-use: clear the OTP now that it's been redeemed.
  admin.otpHash = null;
  admin.otpExpiresAt = null;
  await admin.save();

  const resetToken = await createResetToken(admin.email, RESET_TOKEN_TTL_SECONDS);
  return NextResponse.json({ resetToken });
}
