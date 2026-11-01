import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ReceiptModel } from '@/lib/models/Receipt';

// Receipt upload for the admin Contributions section. Access is gated by the
// admin session check in proxy.ts, which covers everything under
// /api/admin/. Returns the public URL to save as the contribution's receiptUrl.

// Vercel rejects request bodies over 4.5 MB, so stay under that.
const MAX_BYTES = 4 * 1024 * 1024;

// Type is decided from the file's own first bytes, not the browser-supplied
// MIME type, so an HTML or script file renamed to .jpg cannot be served from
// our domain.
function detectType(bytes: Uint8Array): string | null {
  const starts = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (starts(0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (starts(0x89, 0x50, 0x4e, 0x47)) return 'image/png';
  if (starts(0x52, 0x49, 0x46, 0x46) && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp';
  return null;
}

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'Choose a file to upload.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Receipt must be 4 MB or smaller.' }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType = detectType(bytes);
  if (!contentType) {
    return NextResponse.json({ error: 'Receipt must be an image (JPG, PNG or WebP).' }, { status: 400 });
  }

  await connectToDatabase();
  const receipt = await ReceiptModel.create({
    data: Buffer.from(bytes),
    contentType,
    filename: file.name.slice(0, 200),
    size: file.size,
  });

  return NextResponse.json({ success: true, url: `/api/receipts/${receipt._id}` }, { status: 201 });
}
