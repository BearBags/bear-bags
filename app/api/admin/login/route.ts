import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dataRouting } from '@/config/data-routing';
import { connectToDatabase } from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { createSessionToken } from '@/lib/session';

// One-time migration: the admin used to be a single password in ADMIN_PASSWORD.
// If no Admin document exists yet, seed one from ADMIN_PASSWORD/ADMIN_EMAIL so
// existing deployments keep working without a manual migration step.
async function seedAdminIfMissing() {
  const existing = await Admin.findOne();
  if (existing) return;

  const { ADMIN_PASSWORD, ADMIN_EMAIL } = process.env;
  if (!ADMIN_PASSWORD || !ADMIN_EMAIL) return;

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await Admin.create({ email: ADMIN_EMAIL, passwordHash });
}

export async function POST(request: NextRequest) {
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
