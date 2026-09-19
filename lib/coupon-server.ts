import { connectToDatabase } from './mongodb';
import { CouponModel } from './models/Coupon';
import type { Coupon } from './discount';

// Loads the admin-managed campaign coupons. Every price calculation calls this,
// so a database hiccup must not break checkout: on failure we return an empty
// list, which simply means no campaign is on offer and the tier coupons still
// apply.
export async function getCampaignCoupons(): Promise<Coupon[]> {
  try {
    await connectToDatabase();
    const docs = await CouponModel.find({ active: true }).lean();
    return docs.map((doc) => ({
      code: doc.code,
      percent: doc.percent,
      kind: 'campaign' as const,
      blurb: doc.blurb ?? '',
      startsAt: doc.startsAt ?? undefined,
      endsAt: doc.endsAt ?? undefined,
    }));
  } catch (error) {
    console.error('[coupons] could not load campaigns:', error);
    return [];
  }
}
