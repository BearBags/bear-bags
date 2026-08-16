import Link from 'next/link';
import Image from 'next/image';
import {
  FaRegEnvelope,
  FaWhatsapp,
  FaPhone,
  FaInstagram,
  FaLinkedin,
  FaCircleCheck,
  FaAward,
  FaLocationDot,
  FaAmazon,
  FaBolt,
} from 'react-icons/fa6';
import { PiShoppingBagOpenLight } from 'react-icons/pi';

const MARKETPLACES = [
  {
    Icon: FaAmazon,
    label: 'Available on Amazon',
    href: 'https://www.amazon.in/BearBags-Compostable-Garbage-Bags-Certified/dp/B0GLFVGTYD?source=ps-sl-shoppingads-lpcontext&ref_=fplfs&smid=AYWYFFS19CASA&th=1',
  },
  {
    label: 'Available on Blinkit',
    href: 'https://blinkit.com/prn/bear-bags-extra-strong-compostable-garbage-bag/prid/793197',
  },
];

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
    title: 'Made in the India',
    desc: 'Proudly designed and made in the India.',
  },
];

const SOCIALS = [
  { Icon: FaInstagram, href: 'https://www.instagram.com/bearbags.in?utm_source=qr&igsh=MXFhdjl6M2htY2RsMw==' },
  { Icon: FaLinkedin, href: 'https://www.linkedin.com/company/bearbags/posts/?feedView=all' },
  { Icon: FaWhatsapp, href: 'https://wa.me/919131783440' },
];

const Footer = () => {
  return (
    <footer className="bg-[#102219] text-white/60 px-[5%] pt-16 pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 relative shrink-0">
              <Image src="/images/BearBagsLogo.png" alt="Bear Bags Logo" fill className="object-contain" />
            </div>
            <span className="font-['Playfair_Display'] text-xl font-bold text-white">Bear Bags</span>
          </div>

          <p className="text-m leading-7 mb-6 max-w-[260px]">
            100% compostable garbage bags engineered for strength. No Plastic. All Power. Built to give back.
          </p>

          <div className="flex flex-col gap-3 mb-6">
            <a href="mailto:hello@bearbags.in" className="flex items-center gap-3 text-sm hover:text-white transition-colors">
              <span className="w-9 h-9 rounded-full border border-[#9adda9]/40 flex items-center justify-center text-[#9adda9] shrink-0">
                <FaRegEnvelope size={14} />
              </span>
              hello@bearbags.in
            </a>
            <a href="tel:+919131783440" className="flex items-center gap-3 text-sm hover:text-white transition-colors">
              <span className="w-9 h-9 rounded-full border border-[#9adda9]/40 flex items-center justify-center text-[#9adda9] shrink-0">
                <FaPhone size={16} />
              </span>
              +91 91317 83440
            </a>
          </div>

          <div className="flex items-center gap-3">
            {SOCIALS.map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-[#9adda9] hover:text-[#9adda9] transition-colors"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h5 className="text-[11px] font-semibold tracking-[2px] uppercase text-[#9adda9] mb-5">
            Explore
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
          <h5 className="text-[11px] font-semibold tracking-[2px] uppercase text-[#9adda9] mb-5">
            Certifications
          </h5>
          <ul className="flex flex-col gap-5">
            {CERTIFICATIONS.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                {/* <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0c2f2a] shrink-0">
                  <Icon size={16} />
                </span> */}
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
          <h5 className="text-[11px] font-semibold tracking-[2px] uppercase text-[#9adda9] mb-5">
            Shop
          </h5>
      
          <div className="flex flex-col gap-2.5">
            {MARKETPLACES.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-lg border border-white/15 px-4 py-3 text-sm text-white/70 transition-colors hover:border-[#9adda9]/50 hover:bg-white/5 hover:text-white"
              >
                {/* <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#9adda9]/40 text-[#9adda9]">
                  <Icon size={14} />
                </span> */}
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-white/40 pt-6 border-t border-white/10">
        <span>© 2026 Bear Bags</span>
        <span className="text-xs font-semibold tracking-[3px] uppercase text-[#9adda9]">
          No Plastic. All Power.
        </span>
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
