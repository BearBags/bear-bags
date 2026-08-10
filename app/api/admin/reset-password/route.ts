import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { verifyResetToken } from '@/lib/session';

export async function POST(request: NextRequest) {
  const { resetToken, newPassword } = await request.json();
  if (!resetToken || !newPassword || newPassword.length < 8) {
    return NextResponse.json(
      { error: 'A reset token and a password of at least 8 characters are required' },
      { status: 400 }
    );
  }

  const email = await verifyResetToken(resetToken);
  if (!email) {
    return NextResponse.json({ error: 'Reset link expired, request a new code' }, { status: 401 });
  }

  await connectToDatabase();
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return NextResponse.json({ error: 'Reset link expired, request a new code' }, { status: 401 });
  }

  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  await admin.save();

  return NextResponse.json({ success: true });
}
