import type { Metadata } from 'next';
import LegalPage, { type LegalSection } from '../components/LegalPage';

export const metadata: Metadata = {
  title: 'Shipping, Returns & Refund Policy | Bear Bags',
  description: 'How Bear Bags ships orders, and how cancellations, returns and refunds work.',
};

const Bullet = () => <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />;

const SECTIONS: LegalSection[] = [
  {
    heading: 'Shipping',
    body: (
      <ul>
        <li><Bullet /><span>Shipping is free on every order placed on this site. We ship across India.</span></li>
        <li><Bullet /><span>Orders are usually dispatched within 2 working days of confirmation.</span></li>
        <li><Bullet /><span>Delivery normally takes 5–7 working days from dispatch, depending on your pincode. Remote pincodes may take longer.</span></li>
        <li><Bullet /><span>Delivery times are estimates and may be affected by courier delays, weather, public holidays, or circumstances outside our reasonable control.</span></li>
        <li><Bullet /><span>We share tracking details by email or WhatsApp once your order has been handed to the courier.</span></li>
        <li><Bullet /><span>Please provide a complete delivery address and a reachable phone number. If a parcel is returned to us because the address provided was incorrect or delivery could not be completed after reasonable attempts, we can re-ship the order once you cover the additional shipping cost, or refund the amount paid less the shipping costs incurred.</span></li>
      </ul>
    ),
  },
  {
    heading: 'Cancelling an order',
    body: (
      <>
        <p>
          You can cancel an order before it is dispatched by emailing{' '}
          <a href="mailto:hello@bearbags.in">hello@bearbags.in</a> or calling{' '}
          <a href="tel:+919131783440">+91 91317 83440</a> with your order details.
        </p>
        <p>
          If you have already paid, we will refund the full amount. Once an order has been dispatched, it cannot be
          cancelled, but it may be eligible for return under the policy below.
        </p>
      </>
    ),
  },
  {
    heading: 'Returns',
    body: (
      <>
        <p>Please contact us within 7 days of delivery if there is a problem with your order. We accept returns where:</p>
        <ul>
          <li><Bullet /><span>the product or packaging arrived damaged or torn;</span></li>
          <li><Bullet /><span>you received the wrong product, size, or quantity; or</span></li>
          <li><Bullet /><span>the product is defective — for example, the bags tear during normal use.</span></li>
        </ul>
        <p>
          Because our bags are hygiene-related consumable products, we cannot accept returns of opened or used packs
          unless the product is defective.
        </p>
        <p>
          Unopened packs in their original packaging can also be returned within 7 days of delivery. For these returns,
          the customer is responsible for the return shipping cost.
        </p>
        <p>
          To start a return, email <a href="mailto:hello@bearbags.in">hello@bearbags.in</a> with your order number and,
          where relevant, photos showing the issue.
        </p>
        <p>
          For damaged, incorrect, or defective items, we will arrange a pickup where courier service is available at your
          pincode, at no cost to you. If pickup is not available, we will work with you to arrange another return method.
        </p>
      </>
    ),
  },
  {
    heading: 'Refunds',
    body: (
      <ul>
        <li><Bullet /><span>Once we receive the returned item, or approve a claim based on the information provided, we will process the refund within 3 working days.</span></li>
        <li><Bullet /><span>Online payments will be refunded to the original payment method. Once processed, refunds typically take 5–7 working days to appear, depending on your bank or payment provider.</span></li>
        <li><Bullet /><span>Cash on Delivery orders will be refunded by bank transfer or UPI using details you confirm to us.</span></li>
        <li><Bullet /><span>If you used a discount or promotional code, the refund will be based on the amount you actually paid.</span></li>
        <li><Bullet /><span>If you would prefer a replacement instead of a refund for a damaged, incorrect, or defective item, let us know and we will arrange one, subject to availability.</span></li>
      </ul>
    ),
  },
  {
    heading: 'Failed or incomplete payments',
    body: (
      <>
        <p>
          If money is debited from your account but your order is not confirmed, the payment may not have been
          successfully captured. In most cases, the amount is automatically reversed by your bank or payment provider,
          usually within 5–7 working days.
        </p>
        <p>
          If you do not receive the reversal, email <a href="mailto:hello@bearbags.in">hello@bearbags.in</a> with the
          transaction reference. We will check the payment status and help resolve the issue.
        </p>
      </>
    ),
  },
];

const RefundPolicyPage = () => (
  <LegalPage
    title="Shipping, Returns & Refund Policy"
    sections={SECTIONS}
  />
);

export default RefundPolicyPage;
