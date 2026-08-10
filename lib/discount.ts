// First-time shoppers get 7% off; every visit after that gets 5% off.
// Tracked client-side via localStorage since there is no customer login.
const VISITED_KEY = 'bb_has_shopped_before';

export const FIRST_TIME_DISCOUNT_PERCENT = 7;
export const RETURNING_DISCOUNT_PERCENT = 5;

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
