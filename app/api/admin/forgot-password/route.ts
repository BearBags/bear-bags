import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { sendOtpEmail } from '@/lib/mailer';

const OTP_TTL_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  await connectToDatabase();
  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

  // Respond the same way whether or not the email matched, so the endpoint
  // can't be used to check which address is the recovery email.
  if (admin) {
    const otp = crypto.randomInt(100000, 1000000).toString();
    admin.otpHash = await bcrypt.hash(otp, 10);
    admin.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
    await admin.save();
    await sendOtpEmail(admin.email, otp);
  }

  return NextResponse.json({ success: true });
}
