import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import { invoiceOrder } from '@/lib/invoice-service';
import { dataRouting } from '@/config/data-routing';

// Admin order status changes. Access is gated by the admin session check in
// proxy.ts, which covers everything under /api/admin/.
//
//   placed  → shipped    creates the GST invoice in Zoho Books and emails it
//   placed  → cancelled  no invoice is ever created (refund in Razorpay by hand)
//   shipped → delivered
//
// Orders from before statuses existed have none and count as "placed".
const TRANSITIONS = {
  shipped: { from: ['placed'], dateField: 'shippedAt' },
  cancelled: { from: ['placed'], dateField: 'cancelledAt' },
  delivered: { from: ['shipped'], dateField: 'deliveredAt' },
} as const;

type Target = keyof typeof TRANSITIONS;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: 'Unknown order.' }, { status: 400 });

  const body = await request.json().catch(() => null);
  const target = body?.status as Target;
  if (!(target in TRANSITIONS)) return NextResponse.json({ error: 'Unknown status.' }, { status: 400 });
  const { from, dateField } = TRANSITIONS[target];

  await connectToDatabase();
  // Atomic, so two clicks (or two admins) cannot both apply the change.
  const fromFilter = from.includes('placed' as never)
    ? { $or: [{ status: { $in: from } }, { status: { $exists: false } }] }
    : { status: { $in: from } };
  const order = await Order.findOneAndUpdate(
    { _id: id, ...fromFilter },
    { $set: { status: target, [dateField]: new Date() } },
    { returnDocument: 'after' },
  );
  if (!order) {
    return NextResponse.json({ error: `This order can't be marked ${target} from its current status.` }, { status: 409 });
  }

  if (target !== 'shipped' || !dataRouting.invoices.createInZohoBooks) {
    return NextResponse.json({ success: true, status: target });
  }

  // Orders placed before invoicing existed have no invoice record yet.
  if (!order.invoice) await Order.updateOne({ _id: id }, { $set: { invoice: { status: 'pending' } } });
  const invoice = await invoiceOrder(id);
  return NextResponse.json({ success: true, status: target, invoice });
}
