// Fixed-window rate limiter kept in module memory. This is per-instance, so a
// multi-instance deploy allows proportionally more requests -- enough to stop
// casual abuse of the endpoints that cost us money (Razorpay order creation),
// not a substitute for an edge WAF.
interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

// Bounds the map so a flood of unique keys cannot grow it without limit.
const MAX_TRACKED_KEYS = 10_000;

function sweepExpired(now: number): void {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    if (windows.size >= MAX_TRACKED_KEYS) sweepExpired(now);
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

// Vercel and most proxies put the real client IP first in x-forwarded-for.
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}
