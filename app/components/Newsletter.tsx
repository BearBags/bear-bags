'use client';
import { useState } from 'react';
import Image from 'next/image';
import { FiMail, FiArrowRight } from 'react-icons/fi';
import { GoShieldCheck } from 'react-icons/go';

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
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-[#e2ddcd] bg-[#f7f4ec] px-6 py-16 sm:px-10 sm:py-20 lg:min-h-[620px]">

        {/* Logo watermark — bleeds off the left edge */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 top-4 hidden h-[78%] w-[46%] select-none lg:block ml-[6rem]"
        >
          <Image
            src="/images/BearBagsLogoWatermark.png"
            alt=""
            fill
            className="object-contain object-left opacity-[0.55]"
          />
        </div>

        <div className="relative max-w-xl text-left lg:ml-[46%] lg:pt-6">

          {/* Heading */}
          <h2
            className="font-['Playfair_Display'] font-bold leading-[1.08] tracking-tight text-[#16302a]"
            style={{ fontSize: 'clamp(32px, 5.2vw, 54px)' }}
          >
            Your experience
            <br className="hidden sm:block" /> shapes what we build.
          </h2>

          {/* Small divider */}
          <span className="my-6 block h-px w-12 bg-[#3f7a5a]" />

          {/* Subtext */}
          <p className="mb-8 max-w-md text-base leading-relaxed text-[#3f5347] sm:text-lg">
            We listen to the people who use Bear Bags &mdash; what works, what
            doesn&apos;t, and what could be better.
          </p>

          {/* Form / success */}
          {submitted ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-[#102219] px-8 py-4 text-base font-medium text-white">
              ✓ Thank you for subscribing!
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center"
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
          <p className="mt-6 flex items-center gap-2 text-xs text-[#4b5d50] sm:text-sm">
            <GoShieldCheck className="h-4 w-4" />
            No spam. Only occasional, meaningful updates.
          </p>

        </div>
      </div>
    </section>
  );
}
