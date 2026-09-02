'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaCartShopping } from "react-icons/fa6";
import { useCart } from '../context/CartContext';
import Image from 'next/image';
import { TiShoppingCart } from "react-icons/ti";

const NAV_LINKS = [
  { label: 'Home',    href: '/#home' },
  { label: 'Why',     href: '/#why' },
  { label: 'Impact',  href: '/impact' },
  { label: 'Reviews', href: '/#testimonials' },
  { label: 'FAQ',     href: '/#faq' },
  { label: 'Shop',    href: '/medium-size-bag' },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const { cart, openCart } = useCart();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* ── NAVBAR ── sits above the overlay via z-50 */}
      <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-sm relative z-[90] text-[1rem] md:text-[1.2rem] font-semibold">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 relative">
            <Image src="/images/BearBagsLogo.png" alt="Bear Bags Logo" fill className="object-contain" />
          </div>
          <span className="font-semibold text-[#1f3a2f]">Bear Bags</span>
        </Link>

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}><Link href={href}>{label}</Link></li>
          ))}
          <li>
            <button onClick={openCart} aria-label="Open cart" className="relative cursor-pointer">
              <TiShoppingCart size={22}/>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#1f3a2f] text-white text-xs h-5 w-5 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </button>
          </li>
        </ul>

        {/* HAMBURGER — stays on top of overlay (navbar is z-50, overlay is z-40) */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="md:hidden w-10 h-10 flex flex-col justify-center items-center gap-[5px] rounded-lg transition-colors duration-200 hover:bg-[#f0ebe4] active:bg-[#e8e0d5]"
        >
          <span className={`block h-[2px] bg-[#1f3a2f] rounded-full origin-center transition-all duration-300 ease-in-out
            ${open ? 'w-5 rotate-45 translate-y-[7px]' : 'w-5'}`} />
          <span className={`block h-[2px] bg-[#1f3a2f] rounded-full origin-center transition-all duration-200 ease-in-out
            ${open ? 'w-0 opacity-0' : 'w-5 opacity-100'}`} />
          <span className={`block h-[2px] bg-[#1f3a2f] rounded-full origin-center transition-all duration-300 ease-in-out
            ${open ? 'w-5 -rotate-45 -translate-y-[7px]' : 'w-5'}`} />
        </button>
      </nav>

      {/* ── FULL-PAGE OVERLAY ── fades in behind the navbar, above the cart
          drawer (z-70) which stays mounted off-screen at all times. */}
      <div
        className={`md:hidden fixed inset-0 z-[80] bg-white flex flex-col transition-opacity duration-300 ease-in-out
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Offset so links start below the navbar (~72 px tall) */}
        <div className="h-[72px] shrink-0" />

        {/* Links — vertically centered in remaining space */}
        <div className="flex-1 flex flex-col justify-center px-8 pb-10">
          <ul>
            {NAV_LINKS.map(({ label, href }, i) => (
              <li
                key={label}
                style={{
                  opacity:    open ? 1 : 0,
                  transform:  open ? 'translateX(0)' : 'translateX(48px)',
                  transition: 'opacity 0.38s ease, transform 0.38s ease',
                  transitionDelay: open ? `${80 + i * 60}ms` : '0ms',
                }}
              >
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between group py-3.5 border-b border-[#f0ebe4]"
                >
                  <span className="text-[28px] sm:text-[34px] font-bold text-[#1f3a2f] group-hover:text-[#d4a96a] transition-colors duration-200 leading-tight tracking-tight">
                    {label}
                  </span>
                  <svg
                    width="20" height="20" viewBox="0 0 20 20" fill="none"
                    className="text-[#d4a96a] opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all duration-250"
                  >
                    <path d="M3 10h14M10 4l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>

          {/* Cart button — cascades in after all links */}
          <div
            style={{
              opacity:    open ? 1 : 0,
              transform:  open ? 'translateX(0)' : 'translateX(48px)',
              transition: 'opacity 0.38s ease, transform 0.38s ease',
              transitionDelay: open ? `${80 + NAV_LINKS.length * 60}ms` : '0ms',
            }}
            className="mt-8"
          >
            <button
              onClick={() => { setOpen(false); openCart(); }}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#1f3a2f] text-white text-[15px] font-semibold hover:bg-[#2d5240] active:scale-[0.98] transition-all duration-200 shadow-md"
            >
              <FaCartShopping size={16} />
              View Cart
              {cart.length > 0 && (
                <span className="bg-[#d4a96a] text-[#1f3a2f] text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
