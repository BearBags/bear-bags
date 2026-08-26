import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { type LegalSection } from '../components/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service | Bear Bags',
  description: 'The terms that apply when you buy compostable garbage bags from Bear Bags.',
};

const LAST_UPDATED = '26 August 2026';

const Bullet = () => <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />;

const SECTIONS: LegalSection[] = [
  {
    heading: 'Agreement to these terms',
    body: (
      <>
        <p>
          These terms apply to everything you do on bearbags.in — browsing, placing an order, or subscribing to our
          newsletter. By using the site you accept them. If you do not agree with them, please do not use the site.
        </p>
        <p>
          {/* TODO: replace with the registered legal entity name and address before going live. */}
          The site is operated by <strong>[Legal entity name]</strong>, <strong>[registered address]</strong>, India.
        </p>
      </>
    ),
  },
  {
    heading: 'Eligibility',
    body: (
      <p>
        You must be at least 18 years old and able to enter into a contract under Indian law to place an order. We
        currently ship only within India.
      </p>
    ),
  },
  {
    heading: 'Products and descriptions',
    body: (
      <>
        <p>
          We describe our bags — sizes, bag counts, and compostability certifications — as accurately as we can. Product
          photographs are illustrative; slight variation in colour, print, or packaging is normal and is not a defect.
        </p>
        <p>
          Our bags are certified compostable by CPCB, India and to TÜV Austria industrial compostable standards. They
          compost properly under the conditions those certifications describe; they are not designed for long-term
          storage of wet waste or for use as sealed airtight containers.
        </p>
      </>
    ),
  },
  {
    heading: 'Prices and payment',
    body: (
      <>
        <p>
          All prices are in Indian Rupees (₹) and include applicable taxes unless stated otherwise. Shipping is free on
          all orders placed through this site.
        </p>
        <ul>
          <li><Bullet /><span>You can pay online through Razorpay (card, UPI, net banking, and wallets) or choose Cash on Delivery where it is offered.</span></li>
          <li><Bullet /><span>An online order is confirmed only once Razorpay confirms the payment to us. If a payment is debited but the order does not confirm, contact us and we will trace it or refund it.</span></li>
          <li><Bullet /><span>We may correct an obvious pricing error even after you order. If the corrected price is higher, we will ask you to confirm or we will cancel and refund the order in full.</span></li>
        </ul>
      </>
    ),
  },
  {
    heading: 'Discounts and coupons',
    body: (
      <p>
        Discount codes apply to the order they were used on, cannot be exchanged for cash, and cannot be combined unless
        we say so. First-time and returning-customer offers are limited to genuine first-time and returning customers,
        and we may cancel an order where a code has clearly been misused.
      </p>
    ),
  },
  {
    heading: 'Subscribe & Save',
    body: (
      <p>
        If you choose a Subscribe &amp; Save plan, you are agreeing to a recurring order at the stated interval and
        discounted price. We will confirm the schedule with you before the first repeat delivery. You can pause, change,
        or cancel a subscription at any time by writing to hello@bearbags.in before the next dispatch; charges already
        made for a dispatched order follow the refund policy.
      </p>
    ),
  },
  {
    heading: 'Orders, delivery and cancellation',
    body: (
      <p>
        We aim to dispatch orders within 2 working days and deliver within 5–7 working days, depending on your pincode.
        These are estimates, not guarantees. Delivery timelines, cancellation, returns and refunds are set out in full in
        our <Link href="/refunds">Shipping &amp; Refund Policy</Link>, which forms part of these terms.
      </p>
    ),
  },
  {
    heading: 'Acceptable use',
    body: (
      <ul>
        <li><Bullet /><span>Do not use the site for any unlawful purpose, or to place fraudulent or fictitious orders.</span></li>
        <li><Bullet /><span>Do not attempt to gain unauthorised access to the site, its admin area, or its underlying systems.</span></li>
        <li><Bullet /><span>Do not scrape, copy, or resell our content, photographs, or product listings without our written permission.</span></li>
      </ul>
    ),
  },
  {
    heading: 'Intellectual property',
    body: (
      <p>
        The Bear Bags name, logo, photographs, copy, and site design belong to us and are protected by Indian
        intellectual property law. You may not use them without our prior written consent.
      </p>
    ),
  },
  {
    heading: 'Third-party services and links',
    body: (
      <p>
        We link to marketplaces such as Amazon and Blinkit and use third-party services including Razorpay for payments.
        Those services have their own terms and privacy policies, and we are not responsible for their content or
        conduct.
      </p>
    ),
  },
  {
    heading: 'Liability',
    body: (
      <p>
        We are responsible for supplying the products you ordered. To the extent Indian law allows, our total liability
        for any claim connected with an order is limited to the amount you paid for that order, and we are not liable for
        indirect or consequential loss. Nothing here limits liability that cannot lawfully be limited, including
        liability under the Consumer Protection Act, 2019.
      </p>
    ),
  },
  {
    heading: 'Governing law and disputes',
    body: (
      <p>
        {/* TODO: confirm the jurisdiction city with the client before going live. */}
        These terms are governed by the laws of India. Any dispute will be subject to the exclusive jurisdiction of the
        courts at <strong>[city]</strong>, India. We would much rather sort things out directly — email us first.
      </p>
    ),
  },
  {
    heading: 'Changes to these terms',
    body: (
      <p>
        We may update these terms from time to time. The version shown on this page at the moment you place an order is
        the one that applies to that order.
      </p>
    ),
  },
];

const TermsOfServicePage = () => (
  <LegalPage
    title="Terms of Service"
    intro="The rules that apply when you browse this site and buy Bear Bags compostable garbage bags."
    lastUpdated={LAST_UPDATED}
    sections={SECTIONS}
  />
);

export default TermsOfServicePage;
