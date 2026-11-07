import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { invoiceOrder } from '@/lib/invoice-service';

// Admin "Retry invoice" / "Create invoice" for one order. Access is gated by
// the admin session check in proxy.ts, which covers everything under /api/admin/.
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: 'Unknown order.' }, { status: 400 });

  const result = await invoiceOrder(id);
  if (!result) {
    return NextResponse.json(
      { error: 'This order is not shipped yet, is already invoiced, or an invoice is being created right now.' },
      { status: 409 },
    );
  }
  if (result.status !== 'done') {
    return NextResponse.json({ error: result.error ?? 'The invoice could not be created.' }, { status: 502 });
  }
  return NextResponse.json({ success: true, number: result.number });
}
