import Link from 'next/link';
import Image from 'next/image';
import {
  FaRegEnvelope,
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaCircleCheck,
  FaAward,
  FaLocationDot,
} from 'react-icons/fa6';
import { PiShoppingBagOpenLight } from 'react-icons/pi';

const QUICK_LINKS = [
  { label: 'Why', href: '/#why' },
  { label: 'Impact', href: '/impact' },
  { label: 'Reviews', href: '/#testimonials' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Shop Now', href: '/medium-size-bag' },
];

const CERTIFICATIONS = [
  {
    icon: FaCircleCheck,
    title: 'CPCB Certified',
    desc: 'Certified compostable by CPCB, India.',
  },
  {
    icon: FaAward,
    title: 'TÜV Austria Industrial Compostable',
    desc: 'Home & industrial compostable to global standards.',
  },
  {
    icon: FaLocationDot,
    title: 'Made in India',
    desc: 'Proudly designed and made in India.',
  },
];

const SOCIALS = [
  { Icon: FaInstagram, href: '#' },
  { Icon: FaFacebookF, href: '#' },
  { Icon: FaWhatsapp, href: 'https://wa.me/919131783440' },
];

const Footer = () => {
  return (
    <footer className="bg-[#0c2f2a] text-white/60 px-[5%] pt-16 pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 relative shrink-0">
              <Image src="/images/BearBagsLogo.png" alt="Bear Bags Logo" fill className="object-contain" />
            </div>
            <span className="font-['Playfair_Display'] text-xl font-bold text-white">Bear Bags</span>
          </div>

          <p className="text-sm leading-7 mb-6 max-w-[260px]">
            100% compostable garbage bags engineered for strength. No Plastic. All Power. Built to give back.
          </p>

          <div className="flex flex-col gap-3 mb-6">
            <a href="mailto:hello@bearbags.in" className="flex items-center gap-3 text-sm hover:text-white transition-colors">
              <span className="w-9 h-9 rounded-full border border-[#d4a96a]/40 flex items-center justify-center text-[#d4a96a] shrink-0">
                <FaRegEnvelope size={14} />
              </span>
              hello@bearbags.in
            </a>
            <a href="tel:+919131783440" className="flex items-center gap-3 text-sm hover:text-white transition-colors">
              <span className="w-9 h-9 rounded-full border border-[#d4a96a]/40 flex items-center justify-center text-[#d4a96a] shrink-0">
                <FaWhatsapp size={16} />
              </span>
              +91 91317 83440
            </a>
          </div>

          <div className="flex items-center gap-3">
            {SOCIALS.map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-[#d4a96a] hover:text-[#d4a96a] transition-colors"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h5 className="text-[11px] font-semibold tracking-[2px] uppercase text-[#d4a96a] mb-5">
            Quick Links
          </h5>
          <ul>
            {QUICK_LINKS.map(({ label, href }) => (
              <li key={label} className="border-b border-white/10 last:border-none">
                <Link href={href} className="block py-3 text-sm text-white/70 hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Certifications */}
        <div>
          <h5 className="text-[11px] font-semibold tracking-[2px] uppercase text-[#d4a96a] mb-5">
            Certifications
          </h5>
          <ul className="flex flex-col gap-5">
            {CERTIFICATIONS.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0c2f2a] shrink-0">
                  <Icon size={16} />
                </span>
                <div>
                  <p className="text-sm text-white font-medium leading-snug">{title}</p>
                  <p className="text-xs text-white/45 mt-1 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Shop */}
        <div>
          <h5 className="text-[11px] font-semibold tracking-[2px] uppercase text-[#d4a96a] mb-5">
            Shop
          </h5>
          <div className="w-14 h-14 rounded-lg border border-[#d4a96a]/40 flex items-center justify-center text-[#d4a96a] mb-4">
            <PiShoppingBagOpenLight size={26} />
          </div>
          <p className="text-sm text-white/60 leading-relaxed mb-5">
            Strong. Compostable. Delivered to your door.
          </p>
          <Link
            href="/medium-size-bag"
            className="inline-flex items-center gap-2 bg-[#d4a96a] text-[#0c2f2a] text-sm font-semibold px-5 py-3 rounded-lg hover:bg-[#e0bb84] transition-colors"
          >
            Shop Bear Bags <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-white/40 pt-6 border-t border-white/10">
        <span>© 2026 Bear Bags. All rights reserved.</span>
        <span className="flex items-center gap-2">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <span aria-hidden>|</span>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
