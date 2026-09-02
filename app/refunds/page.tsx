import type { Metadata } from 'next';
import LegalPage, { type LegalSection } from '../components/LegalPage';

export const metadata: Metadata = {
  title: 'Shipping & Refund Policy | Bear Bags',
  description: 'How Bear Bags ships orders, and how cancellations, returns and refunds work.',
};

const LAST_UPDATED = '26 August 2026';

const Bullet = () => <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />;

const SECTIONS: LegalSection[] = [
  {
    heading: 'Shipping',
    body: (
      <ul>
        <li><Bullet /><span>Shipping is free on every order placed on this site. We ship across India.</span></li>
        <li><Bullet /><span>Orders are usually dispatched within 2 working days of confirmation.</span></li>
        <li><Bullet /><span>Delivery normally takes 5–7 working days from dispatch, depending on your pincode. Remote pincodes can take longer.</span></li>
        <li><Bullet /><span>We share tracking details by email or WhatsApp once the parcel is handed to the courier.</span></li>
        <li><Bullet /><span>Please give a complete address and a reachable phone number. If a parcel returns to us because the address was wrong or nobody was available across delivery attempts, we can re-ship it once you cover the return cost, or refund the order less that cost.</span></li>
      </ul>
    ),
  },
  {
    heading: 'Cancelling an order',
    body: (
      <p>
        You can cancel any order before it is dispatched by emailing hello@bearbags.in or calling +91 91317 83440 with
        your order details. If you paid online, we refund the full amount. Once a parcel has been dispatched it cannot be
        cancelled — treat it as a return instead.
      </p>
    ),
  },
  {
    heading: 'Returns',
    body: (
      <>
        <p>Tell us within 7 days of delivery if there is a problem with your order. We accept returns where:</p>
        <ul>
          <li><Bullet /><span>the product arrived damaged, torn, or leaking;</span></li>
          <li><Bullet /><span>you received the wrong product, size, or quantity;</span></li>
          <li><Bullet /><span>the product is defective — for example the bags tear in normal use.</span></li>
        </ul>
        <p>
          Because these are hygiene-related consumable products, we cannot accept a return of a pack that has been
          opened or used, unless it is defective. Unopened packs in their original packaging can be returned within
          7 days of delivery.
        </p>
        <p>
          To start a return, email <a href="mailto:hello@bearbags.in">hello@bearbags.in</a> with your order number and a
          photo of the product and packaging. We will arrange a pickup where the courier serves your pincode, at no cost
          to you for damaged, wrong, or defective items.
        </p>
      </>
    ),
  },
  {
    heading: 'Refunds',
    body: (
      <ul>
        <li><Bullet /><span>Once we receive the returned item, or approve a claim from your photos, we process the refund within 3 working days.</span></li>
        <li><Bullet /><span>Online payments are refunded to the original payment method through Razorpay and typically reach you within 5–7 working days, depending on your bank.</span></li>
        <li><Bullet /><span>Cash on Delivery orders are refunded by bank transfer or UPI to an account you confirm to us.</span></li>
        <li><Bullet /><span>Where an order used a discount code, we refund the amount you actually paid.</span></li>
        <li><Bullet /><span>If you would rather have a replacement than a refund, tell us and we will ship one instead.</span></li>
      </ul>
    ),
  },
  {
    heading: 'Payments that fail or go missing',
    body: (
      <p>
        If money is debited but your order is not confirmed, the payment was most likely not captured and your bank will
        reverse it automatically, usually within 5–7 working days. Send us the transaction reference and we will trace it
        with Razorpay and make sure you are not left out of pocket.
      </p>
    ),
  },
];

const RefundPolicyPage = () => (
  <LegalPage
    title="Shipping & Refund Policy"
    intro="How and when your order reaches you, and what happens if you need to cancel, return, or get your money back."
    lastUpdated={LAST_UPDATED}
    sections={SECTIONS}
  />
);

export default RefundPolicyPage;
