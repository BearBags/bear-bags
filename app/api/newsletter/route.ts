import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { NewsletterSubscriber } from '@/lib/models/NewsletterSubscriber';
import { dataRouting } from '@/config/data-routing';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// Every new signup writes to the database.
const MAX_SIGNUPS_PER_WINDOW = 10;
const WINDOW_MS = 60_000;

export async function POST(request: NextRequest) {
  try {
    const { allowed, retryAfterSeconds } = rateLimit(
      `newsletter:${getClientIp(request)}`,
      MAX_SIGNUPS_PER_WINDOW,
      WINDOW_MS,
    );
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
      );
    }

    const body = await request.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (dataRouting.database.storeNewsletterSignups) {
      await connectToDatabase();
      await NewsletterSubscriber.updateOne(
        { email },
        { $setOnInsert: { email } },
        { upsert: true },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[newsletter] failed:', error);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}
