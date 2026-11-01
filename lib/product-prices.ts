import { connectToDatabase } from './mongodb';
import { ProductPrice } from './models/ProductPrice';
import { products, getProductBySlug, type ProductProfile } from './products';

// Live prices: the catalog price in lib/products.ts, overridden by whatever
// the admin has saved. A database hiccup must not take the shop down, so on
// failure we fall back to the catalog prices. Pass `strict` when the result is
// what a customer gets charged: there, a stale catalog price is worse than a
// failed request, so the error is rethrown.
export async function getProductPrices({ strict = false } = {}): Promise<Record<number, number>> {
  const prices: Record<number, number> = Object.fromEntries(products.map((p) => [p.id, p.price]));
  try {
    await connectToDatabase();
    const saved = await ProductPrice.find().lean();
    for (const doc of saved) prices[doc.productId] = doc.price;
  } catch (error) {
    if (strict) throw error;
    console.error('[product-prices] using catalog prices, could not load saved prices:', error);
  }
  return prices;
}

/** The catalog product with its live price. */
export async function getLiveProductBySlug(slug: string): Promise<ProductProfile | undefined> {
  const product = getProductBySlug(slug);
  if (!product) return undefined;
  const prices = await getProductPrices();
  return { ...product, price: prices[product.id] ?? product.price };
}
