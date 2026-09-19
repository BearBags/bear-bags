// Coupons come in two kinds:
//
//   tier      -- earned automatically by order history. First order gets 7%,
//                every order after that gets 5%. The buyer still has to apply
//                the code themselves; qualifying only makes it available.
//   campaign  -- time-boxed codes for festivals, influencers and the like.
//                Anyone may use one inside its window.
//
// Nothing is discounted until a code is applied. `getEligibleCoupons` decides
// what a given buyer may use, and the server re-checks on every price
// calculation so a client cannot award itself a rate it has not earned.
const VISITED_KEY = 'bb_has_shopped_before';

export const FIRST_TIME_DISCOUNT_PERCENT = 7;
export const RETURNING_DISCOUNT_PERCENT = 5;

export const FIRST_TIME_COUPON = 'FIRSTBEAR';
export const RETURNING_COUPON = 'BEARBACK';

export type CouponKind = 'tier' | 'campaign';

export interface Coupon {
  code: string;
  percent: number;
  kind: CouponKind;
  /** Shown under the code in the "Available for you" list. */
  blurb: string;
  /** Campaign coupons only. ISO dates; the window is inclusive of both ends. */
  startsAt?: string;
  endsAt?: string;
}

export const TIER_COUPONS: Record<number, Coupon> = {
  [FIRST_TIME_DISCOUNT_PERCENT]: {
    code: FIRST_TIME_COUPON,
    percent: FIRST_TIME_DISCOUNT_PERCENT,
    kind: 'tier',
    blurb: 'First order? This one is yours.',
  },
  [RETURNING_DISCOUNT_PERCENT]: {
    code: RETURNING_COUPON,
    percent: RETURNING_DISCOUNT_PERCENT,
    kind: 'tier',
    blurb: 'Welcome back! Use this on your order.',
  },
};

// Festival and influencer codes are created and removed from the admin
// dashboard and stored in MongoDB -- see lib/coupon-server.ts. This empty
// default is the fallback used when no campaign list is supplied (and by the
// pure-logic tests), so the tier coupons still work if the lookup fails.
export const CAMPAIGN_COUPONS: Coupon[] = [];

export function normalizeCoupon(code: string): string {
  return code.trim().toUpperCase();
}

export function isCampaignActive(coupon: Coupon, now: Date = new Date()): boolean {
  if (coupon.kind !== 'campaign') return true;
  // Compare on calendar days so a campaign runs to the end of its last day
  // regardless of the hour the check happens to run at.
  const today = now.toISOString().slice(0, 10);
  if (coupon.startsAt && today < coupon.startsAt) return false;
  if (coupon.endsAt && today > coupon.endsAt) return false;
  return true;
}

// Every coupon this buyer may apply: the one tier coupon their history has
// earned, plus whatever campaigns are currently running. Best rate first, so
// the strongest offer heads the list.
//
// `campaigns` comes from the database (see lib/coupon-server.ts). It is passed
// in rather than read here so this stays a pure function -- the admin dashboard
// owns the campaign list, and this module owns the rules.
export function getEligibleCoupons(
  tierPercent: number,
  campaigns: Coupon[] = CAMPAIGN_COUPONS,
  now: Date = new Date(),
): Coupon[] {
  const tier = TIER_COUPONS[tierPercent];
  const active = campaigns.filter((c) => isCampaignActive(c, now));
  return [...(tier ? [tier] : []), ...active].sort((a, b) => b.percent - a.percent);
}

export function findEligibleCoupon(
  code: string,
  tierPercent: number,
  campaigns: Coupon[] = CAMPAIGN_COUPONS,
  now: Date = new Date(),
): Coupon | undefined {
  const normalized = normalizeCoupon(code);
  return getEligibleCoupons(tierPercent, campaigns, now).find((c) => c.code === normalized);
}

/** Does this code exist at all? Distinguishes "not yours" from "not a code". */
export function couponExists(code: string, campaigns: Coupon[] = CAMPAIGN_COUPONS): boolean {
  const normalized = normalizeCoupon(code);
  return (
    Object.values(TIER_COUPONS).some((c) => c.code === normalized) ||
    campaigns.some((c) => c.code === normalized)
  );
}

export function getClientDiscountPercent(): number {
  if (typeof window === 'undefined') return RETURNING_DISCOUNT_PERCENT;

  const hasShoppedBefore = window.localStorage.getItem(VISITED_KEY);
  if (!hasShoppedBefore) {
    window.localStorage.setItem(VISITED_KEY, '1');
    return FIRST_TIME_DISCOUNT_PERCENT;
  }
  return RETURNING_DISCOUNT_PERCENT;
}

export function applyDiscount(price: number, percent: number): number {
  return Math.round(price * (1 - percent / 100));
}
