import { SignJWT, jwtVerify } from 'jose';

function getSecretKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is not set. Add it to .env — see db.md.');
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(maxAgeSeconds: number) {
  return new SignJWT({ purpose: 'session' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.purpose === 'session';
  } catch {
    return false;
  }
}

export async function createResetToken(email: string, maxAgeSeconds: number) {
  return new SignJWT({ purpose: 'reset', email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
    .sign(getSecretKey());
}

export async function verifyResetToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.purpose !== 'reset' || typeof payload.email !== 'string') return null;
    return payload.email;
  } catch {
    return null;
  }
}
