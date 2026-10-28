import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/mongodb';
import { ContributionModel } from '@/lib/models/Contribution';
import { MONTH_RE, isSafeReceiptUrl } from '@/lib/contribution-format';

// Contribution (donation) management for the admin dashboard. Access is gated
// by the admin session check in middleware.ts, which covers everything under
// /api/admin/.

const MAX_AMOUNT = 10_000_000;

type Fields = { month: string; ngo: string; amount: number; funded: string; receiptUrl: string };

function parse(body: Record<string, unknown> | null): { fields: Fields } | { error: string } {
  const month = String(body?.month ?? '').trim();
  const ngo = String(body?.ngo ?? '').trim();
  const amount = Number(body?.amount);
  const funded = String(body?.funded ?? '').trim();
  const receiptUrl = String(body?.receiptUrl ?? '').trim();

  if (!MONTH_RE.test(month)) return { error: 'Pick the month of the contribution.' };
  if (!ngo || ngo.length > 100) return { error: 'NGO name is required (up to 100 characters).' };
  if (!Number.isInteger(amount) || amount < 1 || amount > MAX_AMOUNT) {
    return { error: 'Amount must be a whole number of rupees.' };
  }
  // Kept short so it fits on one line in the /impact contributions table.
  if (!funded || funded.length > 60) return { error: '"What it funded" is required (up to 60 characters).' };
  if (receiptUrl.length > 500 || !isSafeReceiptUrl(receiptUrl)) {
    return { error: 'Receipt must be a site path like /images/receipt.jpg or an https:// link.' };
  }
  return { fields: { month, ngo, amount, funded, receiptUrl } };
}

// The impact and home pages are static; rebuild them with the new figures.
function revalidatePublicPages() {
  revalidatePath('/impact');
  revalidatePath('/');
}

export async function POST(request: NextRequest) {
  const result = parse(await request.json().catch(() => null));
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });

  await connectToDatabase();
  const created = await ContributionModel.create(result.fields);
  revalidatePublicPages();

  return NextResponse.json({ success: true, id: String(created._id) }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const id = String(body?.id ?? '');
  if (!id) return NextResponse.json({ error: 'Missing contribution id.' }, { status: 400 });

  const result = parse(body);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });

  await connectToDatabase();
  const updated = await ContributionModel.findByIdAndUpdate(id, result.fields);
  if (!updated) return NextResponse.json({ error: 'Contribution not found.' }, { status: 404 });
  revalidatePublicPages();

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing contribution id.' }, { status: 400 });

  await connectToDatabase();
  const deleted = await ContributionModel.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: 'Contribution not found.' }, { status: 404 });
  revalidatePublicPages();

  return NextResponse.json({ success: true });
}
