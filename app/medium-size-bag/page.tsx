import { notFound } from 'next/navigation';
import { getLiveProductBySlug } from '@/lib/product-prices';
import MediumBagView from './MediumBagView';

// Static page, rebuilt when the admin changes the price (revalidatePath in
// app/api/admin/products) and every 5 minutes as a safety net.
export const revalidate = 300;

export default async function MediumSizeBagPage() {
  const product = await getLiveProductBySlug('medium-size-bag');
  if (!product) notFound();
  return <MediumBagView product={product} />;
}
