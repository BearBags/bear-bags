import type { Metadata } from 'next';
import LegalPage, { type LegalSection } from '../components/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy | Bear Bags',
  description: 'How Bear Bags collects, uses, and protects your personal information.',
};

const LAST_UPDATED = '26 August 2026';

const SECTIONS: LegalSection[] = [
  {
    heading: 'Who we are',
    body: (
      <>
        <p>
          Bear Bags (&ldquo;Bear Bags&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) sells compostable garbage bags in India
          through this website and through marketplaces such as Amazon and Blinkit. This policy explains what we do with
          the personal information you give us on this website.
        </p>
        <p>
          {/* TODO: replace with the registered legal entity name and address before going live. */}
          Registered entity: <strong>[Legal entity name]</strong>, <strong>[registered address]</strong>. Contact:
          hello@bearbags.in.
        </p>
      </>
    ),
  },
  {
    heading: 'Information we collect',
    body: (
      <>
        <p>We only collect what we need to take and deliver your order:</p>
        <ul>
          <li>
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />
            <span><strong>Order details</strong> — your name, email address, phone number, delivery address, city and pincode, the items and quantities you ordered, and your chosen payment method.</span>
          </li>
          <li>
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />
            <span><strong>Payment references</strong> — if you pay online, we store the Razorpay order and payment identifiers so we can match a payment to your order. We never see or store your card, UPI, or bank credentials.</span>
          </li>
          <li>
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />
            <span><strong>Newsletter email</strong> — if you subscribe, we store the email address you enter.</span>
          </li>
          <li>
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />
            <span><strong>Local browser storage</strong> — your cart and any discount applied to it are kept in your own browser so the cart survives a page refresh. This stays on your device.</span>
          </li>
        </ul>
        <p>We do not ask for and do not want sensitive personal data such as government ID numbers or health information.</p>
      </>
    ),
  },
  {
    heading: 'How we use it',
    body: (
      <ul>
        <li>
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />
          <span>To process, pack, and deliver your order and to handle returns or refunds.</span>
        </li>
        <li>
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />
          <span>To contact you about that order — confirmation, delivery updates, or a problem with the address.</span>
        </li>
        <li>
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />
          <span>To manage a Subscribe &amp; Save plan, if you choose one.</span>
        </li>
        <li>
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />
          <span>To send occasional product news, but only to the email addresses that subscribed to our newsletter.</span>
        </li>
        <li>
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />
          <span>To keep our own records for accounting and tax purposes.</span>
        </li>
      </ul>
    ),
  },
  {
    heading: 'Who we share it with',
    body: (
      <>
        <p>We do not sell your personal information. We share it only with the services that make an order work:</p>
        <ul>
          <li>
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />
            <span><strong>Razorpay</strong> — our payment gateway, for online payments. Your payment details go directly to Razorpay and are handled under their privacy policy.</span>
          </li>
          <li>
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />
            <span><strong>Zoho CRM</strong> — where we record orders and enquiries so our team can follow up on them.</span>
          </li>
          <li>
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />
            <span><strong>MongoDB Atlas</strong> — our database host, where order and subscriber records are stored.</span>
          </li>
          <li>
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />
            <span><strong>Delivery partners</strong> — the courier gets your name, address and phone number so they can deliver the parcel.</span>
          </li>
        </ul>
        <p>We may also disclose information where the law requires it, or to protect our legal rights.</p>
      </>
    ),
  },
  {
    heading: 'How long we keep it',
    body: (
      <p>
        Order records are kept for as long as we need them for warranty, accounting and tax purposes — normally eight
        years, as Indian tax law requires. Newsletter subscriptions are kept until you unsubscribe. Cart data in your
        browser clears when you clear your browser storage.
      </p>
    ),
  },
  {
    heading: 'Your choices',
    body: (
      <>
        <p>You can ask us to:</p>
        <ul>
          <li>
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />
            <span>show you the personal information we hold about you;</span>
          </li>
          <li>
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />
            <span>correct anything that is wrong;</span>
          </li>
          <li>
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />
            <span>delete it, where we are not required to keep it for legal or accounting reasons;</span>
          </li>
          <li>
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />
            <span>stop sending you marketing email — every newsletter also has an unsubscribe link.</span>
          </li>
        </ul>
        <p>
          Email <a href="mailto:hello@bearbags.in">hello@bearbags.in</a> and we will respond within 30 days.
        </p>
      </>
    ),
  },
  {
    heading: 'Security',
    body: (
      <p>
        Traffic to this site is encrypted over HTTPS, payments run through Razorpay&rsquo;s PCI-DSS compliant gateway, and
        access to our order database is restricted to authorised staff. No system is perfectly secure, but we take
        reasonable steps to protect your data and will tell you if a breach affects it.
      </p>
    ),
  },
  {
    heading: 'Children',
    body: (
      <p>
        This site is not intended for anyone under 18. We do not knowingly collect information from children. If you
        believe a child has given us their details, write to us and we will delete them.
      </p>
    ),
  },
  {
    heading: 'Changes to this policy',
    body: (
      <p>
        We may update this policy as our business changes. The date at the top always shows the current version, and
        material changes will be highlighted on this page.
      </p>
    ),
  },
];

const PrivacyPolicyPage = () => (
  <LegalPage
    title="Privacy Policy"
    intro="What we collect when you shop with Bear Bags, why we collect it, and what you can ask us to do about it."
    lastUpdated={LAST_UPDATED}
    sections={SECTIONS}
  />
);

export default PrivacyPolicyPage;
