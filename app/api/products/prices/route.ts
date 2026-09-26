import { NextResponse } from 'next/server';
import { getProductPrices } from '@/lib/product-prices';

// Current price of every product, keyed by product id. The cart stores the
// price an item had when it was added, so it reads this on load to show the
// price the customer will actually be charged.
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ prices: await getProductPrices() });
}
