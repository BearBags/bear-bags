import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { verifyResetToken } from '@/lib/session';

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  const { resetToken, newPassword } = await request.json();
  if (!resetToken || typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `The new password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
      { status: 400 },
    );
  }

  if (!(await verifyResetToken(resetToken))) {
    return NextResponse.json({ error: 'This reset has expired. Please request a new code.' }, { status: 401 });
  }

  // There is a single admin account.
  await connectToDatabase();
  const admin = await Admin.findOne();
  if (!admin) {
    return NextResponse.json({ error: 'No admin account found.' }, { status: 404 });
  }

  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  await admin.save();

  return NextResponse.json({ success: true });
}
