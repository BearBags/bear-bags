import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  await connectToDatabase();
  const admin = await Admin.findOne();
  return NextResponse.json({ email: admin?.email ?? null });
}

export async function PUT(request: NextRequest) {
  const { email } = await request.json();
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
  }

  await connectToDatabase();
  const admin = await Admin.findOne();
  if (!admin) {
    return NextResponse.json({ error: 'No admin account found' }, { status: 404 });
  }

  admin.email = email.toLowerCase().trim();
  await admin.save();

  return NextResponse.json({ success: true, email: admin.email });
}
