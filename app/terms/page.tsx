import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { type LegalSection } from '../components/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service | Bear Bags',
  description: 'The terms that apply when you buy compostable garbage bags from Bear Bags.',
};

const SECTIONS: LegalSection[] = [
  {
    heading: 'Agreement to these terms',
    body: (
      <>
        <p>
          These terms apply when you use bearbags.in, including when you browse the site, place an order, or subscribe
          to our communications. By using the site, you agree to these terms.
        </p>
        <p>
          The site is operated by Eye of Arjuna, a proprietorship trading under the brand name Bear Bags, having its
          principal place of business at 17/7, Maruti Kripa, Station Road, Near HDFC Bank, Mahatma Gandhi Marg, Ratlam,
          Madhya Pradesh – 457001, India.
        </p>
        <p>References to “Bear Bags”, “we”, “us” and “our” in these terms mean Eye of Arjuna.</p>
      </>
    ),
  },
  {
    heading: 'Eligibility',
    body: (
      <>
        <p>
          You must be at least 18 years old and legally capable of entering into a contract under Indian law to place an
          order.
        </p>
        <p>We currently ship orders placed through this website only within India.</p>
      </>
    ),
  },
  {
    heading: 'Products and descriptions',
    body: (
      <>
        <p>
          We aim to describe our products, including their sizes, bag counts, materials and certifications, as
          accurately as possible.
        </p>
        <p>
          Product photographs are illustrative. Minor variations in colour, print, dimensions or packaging may occur and
          do not necessarily constitute a defect.
        </p>
        <p>
          Our compostable garbage bags are manufactured in accordance with the certifications and standards stated on
          the product packaging, including applicable CPCB requirements and IS/ISO 17088 standards. The product is also
          TÜV Austria certified for industrial composting.
        </p>
        <p>
          Composting requires appropriate composting conditions and facilities. Actual decomposition time and conditions
          may vary depending on the composting environment.
        </p>
      </>
    ),
  },
  {
    heading: 'Prices and payment',
    body: (
      <>
        <p>
          All prices displayed on this website are in Indian Rupees (₹) and include applicable taxes unless stated
          otherwise. Shipping is free on orders placed through this website.
        </p>
        <p>
          You can pay online through the payment methods made available at checkout, or choose Cash on Delivery where it
          is offered.
        </p>
        <p>
          Online payments are currently processed through Razorpay. An online order is confirmed once we receive
          successful payment confirmation from our payment provider and issue an order confirmation.
        </p>
        <p>
          If a payment is debited but your order is not confirmed, contact us and we will help trace the transaction or
          arrange a refund where applicable.
        </p>
        <p>
          We may correct an obvious pricing or listing error. If an order has already been placed and the corrected price
          is higher, we will ask you to confirm the revised price or cancel the affected order and refund any amount
          already paid.
        </p>
      </>
    ),
  },
  {
    heading: 'Discounts and coupons',
    body: (
      <>
        <p>
          Discount codes apply only in accordance with the conditions stated with the offer. They cannot be exchanged for
          cash or combined with other offers unless we expressly allow it.
        </p>
        <p>
          First-time, returning-customer or other eligibility-based offers are intended only for customers who meet the
          stated conditions. We may reject or cancel the use of a promotional code where it has clearly been misused.
        </p>
      </>
    ),
  },
  {
    heading: 'Orders, delivery and cancellation',
    body: (
      <>
        <p>
          We aim to dispatch orders within 2 working days of confirmation. Delivery normally takes approximately 5–7
          working days from dispatch, depending on the delivery location. These timelines are estimates and are not
          guaranteed.
        </p>
        <p>
          Customers are responsible for providing complete and accurate delivery and contact information. Delivery may be
          delayed or unsuccessful where incorrect or incomplete information has been provided.
        </p>
        <p>
          Our rules regarding delivery, cancellations, returns, replacements and refunds are explained in our{' '}
          <Link href="/refunds">Shipping &amp; Refund Policy</Link>, which forms part of these terms.
        </p>
      </>
    ),
  },
  {
    heading: 'Acceptable use',
    body: (
      <>
        <p>You must not use this website for any unlawful purpose or to place fraudulent or fictitious orders.</p>
        <p>
          You must not attempt to gain unauthorised access to the website, its administrative areas, accounts, servers or
          underlying systems.
        </p>
        <p>
          You may not scrape, reproduce, copy, commercially exploit or resell our original content, photographs or
          product listings without our prior written permission.
        </p>
      </>
    ),
  },
  {
    heading: 'Intellectual property',
    body: (
      <>
        <p>
          The Bear Bags name, logo, original photographs, copy, graphics and other brand materials on this website are
          owned by or licensed to us and are protected by applicable intellectual property laws.
        </p>
        <p>
          You may not reproduce or use these materials for commercial purposes without our prior written consent.
        </p>
      </>
    ),
  },
  {
    heading: 'Third-party services and links',
    body: (
      <>
        <p>
          Our website may link to third-party websites and marketplaces, including Amazon and Blinkit, and may use
          third-party services such as Razorpay for payment processing.
        </p>
        <p>
          Third-party websites and services are governed by their own terms and privacy policies. We are not responsible
          for the content or availability of third-party websites that we do not control.
        </p>
      </>
    ),
  },
  {
    heading: 'Liability',
    body: (
      <>
        <p>
          We are responsible for supplying the products you ordered. To the extent Indian law allows, our total liability
          for any claim connected with an order is limited to the amount you paid for that order, and we are not liable
          for indirect or consequential loss.
        </p>
        <p>
          Nothing in these terms excludes, restricts or limits any rights or remedies available to you under the Consumer
          Protection Act, 2019 or any other applicable law.
        </p>
      </>
    ),
  },
  {
    heading: 'Governing Laws and Disputes',
    body: (
      <>
        <p>These terms are governed by the laws of India.</p>
        <p>
          Any dispute relating to these terms, this website or an order placed through it will be subject to the
          jurisdiction of the competent courts and consumer forums in accordance with applicable law.
        </p>
        <p>
          If you have a concern, we encourage you to contact us first at{' '}
          <a href="mailto:hello@bearbags.in">hello@bearbags.in</a> so that we can try to resolve it promptly
        </p>
      </>
    ),
  },
  {
    heading: 'Changes to these terms',
    body: (
      <>
        <p>We may update these terms from time to time.</p>
        <p>
          For an order, the version of these terms in effect when you place that order will apply to that order. Updated
          terms will apply to future use of the website from the date they are published.
        </p>
      </>
    ),
  },
];

const TermsOfServicePage = () => (
  <LegalPage
    title="Terms of Service"
    sections={SECTIONS}
  />
);

export default TermsOfServicePage;
