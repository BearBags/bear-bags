'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaCartShopping } from "react-icons/fa6";
import { useCart } from '../context/CartContext';
import Image from 'next/image';

const Header = () => {
  const [open, setOpen] = useState(false);
  const { cart } = useCart();

  return (
    <>
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-sm relative text-[1rem] md:text-[1.2rem] font-semibold">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 relative">
            <Image
              src="/images/BearBagsLogo.png"
              alt="Bear Bags Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-semibold text-[#1f3a2f]">Bear Bags</span>
        </Link>

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex items-center gap-6">
          <li><Link href="/#home">Home</Link></li>
          <li><Link href="/#why">Why</Link></li>
          <li><Link href="/impact">Impact</Link></li>
          <li><Link href="/#testimonials">Reviews</Link></li>
          <li><Link href="/#faq">FAQ</Link></li>
          <li><Link href="/medium-size-bag">Shop</Link></li>

          {/* CART */}
          <li>
            <Link href="/checkout" className="relative cursor-pointer">
              <FaCartShopping size={22} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#1f3a2f] text-white text-xs h-5 w-5 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </Link>
          </li>
        </ul>

        {/* HAMBURGER */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col justify-center items-center gap-1"
        >
          <span className={`block w-6 h-0.5 bg-black transition-all ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
          <span className={`block w-6 h-0.5 bg-black transition-all ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-black transition-all ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        } bg-white shadow-md`}
      >
        <ul className="flex flex-col items-center gap-4 py-6">
          <li><Link href="/#home" onClick={() => setOpen(false)}>Home</Link></li>
          <li><Link href="/#why" onClick={() => setOpen(false)}>Why</Link></li>
          <li><Link href="/#impact" onClick={() => setOpen(false)}>Impact</Link></li>
          <li><Link href="/#testimonials" onClick={() => setOpen(false)}>Reviews</Link></li>
          <li><Link href="/#faq" onClick={() => setOpen(false)}>FAQ</Link></li>
          <li><Link href="/medium-size-bag" onClick={() => setOpen(false)}>Shop</Link></li>

          {/* CART */}
          <li>
            <Link href="/checkout" onClick={() => setOpen(false)} className="flex items-center gap-2">
              <FaCartShopping />
              Cart ({cart.length})
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Header;