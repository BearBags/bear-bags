import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/mongodb';
import { ProductPrice } from '@/lib/models/ProductPrice';
import { getProductById } from '@/lib/products';

// Price management for the admin dashboard. Access is gated by the admin
// session check in middleware.ts, which covers everything under /api/admin/.
const MAX_PRICE = 100_000;

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const productId = Number(body?.productId);
  const price = Number(body?.price);

  if (!getProductById(productId)) {
    return NextResponse.json({ error: 'Unknown product.' }, { status: 400 });
  }
  if (!Number.isInteger(price) || price < 1 || price > MAX_PRICE) {
    return NextResponse.json({ error: 'Price must be a whole number of rupees between 1 and 100000.' }, { status: 400 });
  }

  await connectToDatabase();
  await ProductPrice.findOneAndUpdate(
    { productId },
    { price, updatedAt: new Date() },
    { upsert: true },
  );

  // The home and product pages are static; rebuild them with the new price.
  revalidatePath('/');
  revalidatePath('/medium-size-bag');

  return NextResponse.json({ success: true, price });
}
