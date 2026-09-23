import { permanentRedirect } from 'next/navigation';

// The medium bag is the only product sold on the site, so the old /products
// listing sends visitors straight to its page.
export default function ProductsPage() {
  permanentRedirect('/medium-size-bag');
}
