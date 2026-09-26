import { permanentRedirect } from 'next/navigation';

// The old /shop listing had placeholder products and prices. The medium bag is
// the only product sold, so send visitors straight to its page.
export default function ShopPage() {
  permanentRedirect('/medium-size-bag');
}
