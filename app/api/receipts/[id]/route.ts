import { NextRequest } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { ReceiptModel } from '@/lib/models/Receipt';

// Public: serves an uploaded receipt so the "View" link on /impact works.
// Receipts never change once uploaded (a new upload gets a new id), so they
// can be cached for a long time.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) return new Response('Not found', { status: 404 });

  await connectToDatabase();
  const receipt = await ReceiptModel.findById(id).lean();
  if (!receipt) return new Response('Not found', { status: 404 });

  return new Response(new Uint8Array(receipt.data), {
    headers: {
      'Content-Type': receipt.contentType,
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
