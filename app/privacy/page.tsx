import type { Metadata } from 'next';
import LegalPage, { type LegalSection } from '../components/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy | Bear Bags',
  description: 'How Bear Bags collects, uses, and protects your personal information.',
};

const Bullet = () => <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#23473f]" />;

const SECTIONS: LegalSection[] = [
  {
    heading: 'Who we are',
    body: (
      <>
        <p>
          Bear Bags (&ldquo;Bear Bags&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) sells compostable garbage bags in India
          through this website and other online and offline sales channels. This policy explains how we collect, use,
          store and share personal information when you use this website.
        </p>
        <p>Bear Bags is a brand operated by Eye of Arjuna, a proprietorship owned by Anita Chouhan.</p>
        <p>
          Registered address: 17/7, Maruti Kripa, Station Road, Mahatma Gandhi Marg, Ratlam, Madhya Pradesh – 457001,
          India.
        </p>
        <p>
          Contact: <a href="mailto:hello@bearbags.in">hello@bearbags.in</a>
        </p>
      </>
    ),
  },
  {
    heading: 'Information we collect',
    body: (
      <>
        <p>
          We collect personal information needed to operate our website, process and deliver orders, provide customer
          support, and communicate with you where you have chosen to hear from us.
        </p>
        <ul>
          <li>
            <Bullet />
            <span><strong>Order details</strong> — your name, email address, phone number, delivery address, city and pincode, the items and quantities ordered, and your chosen payment method.</span>
          </li>
          <li>
            <Bullet />
            <span><strong>Payment information</strong> — when you pay online, payments are processed by our payment service provider. We may receive and store transaction references needed to confirm and reconcile your payment, but we do not see or store your card, UPI PIN, or bank account credentials.</span>
          </li>
          <li>
            <Bullet />
            <span><strong>Newsletter information</strong> — if you subscribe to our newsletter or other marketing communications, we store the contact information you provide.</span>
          </li>
          <li>
            <Bullet />
            <span><strong>Website and device information</strong> — we may collect limited technical information generated when you use our website, such as browser or device information, IP address, and website activity, where required for security, performance, analytics or improving the website.</span>
          </li>
          <li>
            <Bullet />
            <span><strong>Local browser storage</strong> — information such as your cart and applied discounts may be stored in your browser so that your selections remain available when you return to or refresh the website.</span>
          </li>
        </ul>
        <p>
          We do not intentionally ask you to provide sensitive personal information such as government identification
          numbers, financial credentials or health information.
        </p>
      </>
    ),
  },
  {
    heading: 'How we use it',
    body: (
      <>
        <p>We use your personal information:</p>
        <ul>
          <li>
            <Bullet />
            <span>To process, pack and deliver your order, and to handle cancellations, returns, refunds or replacements.</span>
          </li>
          <li>
            <Bullet />
            <span>To communicate with you about your order, including confirmations, delivery updates, customer support or any issue with your order or delivery.</span>
          </li>
          <li>
            <Bullet />
            <span>To send you product updates, news or other marketing communications where you have chosen to receive them. You can unsubscribe at any time.</span>
          </li>
          <li>
            <Bullet />
            <span>To maintain records required for accounting, tax, legal and business purposes.</span>
          </li>
          <li>
            <Bullet />
            <span>To operate, secure and improve our website and services.</span>
          </li>
        </ul>
      </>
    ),
  },
  {
    heading: 'Who we share it with',
    body: (
      <>
        <p>
          We do not sell your personal information. We share it only where necessary to operate our website, process and
          deliver orders, provide customer support, or meet legal requirements.
        </p>
        <p>This may include:</p>
        <ul>
          <li>
            <Bullet />
            <span><strong>Payment service providers</strong> — to securely process online payments and confirm transactions.</span>
          </li>
          <li>
            <Bullet />
            <span><strong>Technology and service providers</strong> — that help us operate our website, store order or customer records, and provide customer support.</span>
          </li>
          <li>
            <Bullet />
            <span><strong>Delivery partners</strong> — who receive information such as your name, delivery address and phone number where needed to deliver your order.</span>
          </li>
          <li>
            <Bullet />
            <span><strong>Professional or regulatory authorities</strong> — where disclosure is required by law, for accounting or tax compliance, or to protect our legal rights.</span>
          </li>
        </ul>
      </>
    ),
  },
  {
    heading: 'How long we keep it',
    body: (
      <>
        <p>
          We keep personal information only for as long as reasonably necessary for the purposes described in this policy
          and to meet applicable legal, accounting and tax requirements.
        </p>
        <p>
          Newsletter subscription details are kept until you unsubscribe or we no longer need them. Information stored
          locally in your browser remains there until it is cleared by you or your browser.
        </p>
      </>
    ),
  },
  {
    heading: 'Your choices',
    body: (
      <>
        <p>You can contact us to:</p>
        <ul>
          <li>
            <Bullet />
            <span>ask what personal information we hold about you;</span>
          </li>
          <li>
            <Bullet />
            <span>correct or update information that is inaccurate;</span>
          </li>
          <li>
            <Bullet />
            <span>request deletion of your information, where we are not required to retain it for legal, accounting or other legitimate purposes;</span>
          </li>
          <li>
            <Bullet />
            <span>unsubscribe from marketing communications at any time; or</span>
          </li>
          <li>
            <Bullet />
            <span>raise a concern about how we collect or use your personal information.</span>
          </li>
        </ul>
        <p>
          Email <a href="mailto:hello@bearbags.in">hello@bearbags.in</a> with your request or concern. We will respond
          within a reasonable period and in accordance with applicable law.
        </p>
      </>
    ),
  },
  {
    heading: 'Security',
    body: (
      <>
        <p>
          We take reasonable technical and organisational measures to protect your personal information against
          unauthorised access, loss, misuse or disclosure.
        </p>
        <p>
          Online payments are processed securely through our payment service provider, and access to customer and order
          information is restricted to those who need it.
        </p>
        <p>
          No system is completely secure. If a personal data breach occurs, we will take appropriate steps and provide
          notifications where required by applicable law.
        </p>
      </>
    ),
  },
  {
    heading: 'Children',
    body: (
      <p>
        This website is not intended for anyone under 18. We do not knowingly collect personal information from children.
        If you believe a child has provided us with personal information, please contact us at{' '}
        <a href="mailto:hello@bearbags.in">hello@bearbags.in</a> so we can take appropriate action.
      </p>
    ),
  },
  {
    heading: 'Changes to this policy',
    body: (
      <p>
        We may update this policy from time to time to reflect changes in our business, website, services or legal
        requirements. The &ldquo;Last updated&rdquo; date at the top of this page will show when the policy was most
        recently revised.
      </p>
    ),
  },
];

const PrivacyPolicyPage = () => (
  <LegalPage
    title="Privacy Policy"
    sections={SECTIONS}
  />
);

export default PrivacyPolicyPage;
