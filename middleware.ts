import { NextRequest, NextResponse } from 'next/server';
import { dataRouting } from '@/config/data-routing';
import { verifySessionToken } from '@/lib/session';

const PUBLIC_API_PATHS = [
  '/api/admin/login',
  '/api/admin/forgot-password',
  '/api/admin/verify-otp',
  '/api/admin/reset-password',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const prefix = dataRouting.admin.routePrefix;

  // Allow the login page and the unauthenticated auth APIs through without a session check
  if (pathname === `${prefix}/login` || PUBLIC_API_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname.startsWith(prefix) || pathname.startsWith('/api/admin/')) {
    const session = request.cookies.get(dataRouting.admin.sessionCookieName);
    if (!session || !(await verifySessionToken(session.value))) {
      return NextResponse.redirect(new URL(`${prefix}/login`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
