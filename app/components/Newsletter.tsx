'use client';
import { useState } from 'react';
import Image from 'next/image';
import { FiMail, FiArrowRight } from 'react-icons/fi';
import { GoShieldCheck } from 'react-icons/go';

function BearPaw({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden className={className}>
      {/* palm pad */}
      <path d="M50 52 C34 52 25 62 26 74 C27 86 40 93 50 93 C60 93 73 86 74 74 C75 62 66 52 50 52 Z" />
      {/* toe pads */}
      <ellipse cx="24" cy="45" rx="8" ry="11" />
      <ellipse cx="42" cy="35" rx="8" ry="12" />
      <ellipse cx="58" cy="35" rx="8" ry="12" />
      <ellipse cx="76" cy="45" rx="8" ry="11" />
      {/* claws */}
      <path d="M24 22 C21 27 21 30 24 33 C27 30 27 27 24 22 Z" />
      <path d="M42 11 C39 16 39 19 42 22 C45 19 45 16 42 11 Z" />
      <path d="M58 11 C55 16 55 19 58 22 C61 19 61 16 58 11 Z" />
      <path d="M76 22 C73 27 73 30 76 33 C79 30 79 27 76 22 Z" />
    </svg>
  );
}

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      } catch {
        // Non-blocking: show success to user even if CRM save fails
      }
      setSubmitted(true);
      setTimeout(() => {
        setEmail('');
        setSubmitted(false);
      }, 3000);
    }
  };

  return (
    <section id="newsletter" className="bg-[#f3f0e6] px-4 py-14 sm:py-20">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-[#d9d3c4] px-6 py-16 sm:px-10 sm:py-24">

        {/* Logo watermark */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-2/5 select-none overflow-hidden"
        >
          <Image
            src="/images/BearBagsLogoWatermark.png"
            alt=""
            fill
            className="object-contain object-left opacity-[0.34]"
          />
        </div>

        <div className="relative mx-auto max-w-2xl text-center">

          {/* Paw divider */}
          {/* <div className="mb-8 flex items-center justify-center gap-4">
            <span className="h-px w-16 bg-[#16302a]/25" />
            <BearPaw className="h-14 w-14 text-[#16302a]" />
            <span className="h-px w-16 bg-[#16302a]/25" />
          </div> */}

          {/* Heading */}
          <h2
            className="font-['Playfair_Display'] font-bold leading-[1.08] tracking-tight text-[#16302a]"
            style={{ fontSize: 'clamp(32px, 5.2vw, 54px)' }}
          >
            We&apos;re building
            <br className="hidden sm:block" /> more than a product.
          </h2>

          {/* Small divider */}
          <span className="mx-auto my-6 block h-px w-16 bg-[#16302a]/25" />

          {/* Subtext */}
          <p className="mx-auto mb-10 max-w-md text-base leading-relaxed text-[#3f5347] sm:text-lg">
            We&apos;ll share what we&apos;re building, the impact we&apos;re making, and
            the ideas that shape Bear Bags.
          </p>

          {/* Form / success */}
          {submitted ? (
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-[#102219] px-8 py-4 text-base font-medium text-white">
              ✓ Thank you for subscribing!
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center"
            >
              <div className="relative flex-1">
                <FiMail className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-full border border-[#d9d3c4] bg-white/80 py-4 pl-12 pr-5 text-base text-[#1c1c1a] outline-none transition-colors placeholder:text-gray-400 focus:border-[#16302a]/40"
                />
              </div>
              <button
                type="submit"
                className="flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#102219] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#1a3a2a]"
              >
                Build With Us
                <FiArrowRight className="h-5 w-5" />
              </button>
            </form>
          )}

          {/* Privacy note */}
          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-[#4b5d50] sm:text-sm">
            <GoShieldCheck className="h-4 w-4" />
            No spam. Only occasional updates.
          </p>

        </div>
      </div>
    </section>
  );
}
