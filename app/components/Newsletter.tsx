'use client';
import { useState } from 'react';
import { FiMail, FiArrowRight } from 'react-icons/fi';
import { GoShieldCheck } from 'react-icons/go';
import { PiLeafBold } from 'react-icons/pi';
import { GiVines } from 'react-icons/gi';

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
    <section
      id="newsletter"
      className="relative overflow-hidden bg-[#A9BC8E] border-b-[6px] border-[#102219] py-16 sm:py-20"
    >
      {/* Decorative branch */}
      <GiVines
        aria-hidden
        className="pointer-events-none absolute -right-8 -bottom-14 text-[#102219]/15 w-[220px] h-[220px] sm:w-[320px] sm:h-[320px] rotate-12"
      />

      <div className="relative max-w-xl mx-auto text-center px-4">

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="w-10 h-px bg-[#16302a]/40" />
          <PiLeafBold className="text-[#16302a] w-4 h-4" />
          <span className="w-10 h-px bg-[#16302a]/40" />
        </div>

        {/* Heading */}
        <h2
          className="font-['Playfair_Display'] font-bold tracking-tight mb-3 text-[#16302a]"
          style={{ fontSize: 'clamp(26px, 4vw, 38px)' }}
        >
          We&apos;ll share what happens next.
        </h2>

        {/* Subtext */}
        <p className="text-[15px] sm:text-base leading-relaxed max-w-md mx-auto mb-8 text-[#3f5347]">
          Contributions, projects, and future launches — whenever there&apos;s something worth sharing.
        </p>

        {/* Form / success */}
        {submitted ? (
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-[#102219] text-white">
            ✓ Thank you for subscribing!
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 max-w-md mx-auto"
          >
            <div className="relative flex-1">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-full outline-none transition-all pl-11 pr-4 py-3 text-sm bg-white text-[#1c1c1a] placeholder:text-gray-400 border-2 border-transparent focus:border-[#102219]/30"
              />
            </div>
            <button
              type="submit"
              className="flex cursor-pointer items-center gap-2 rounded-full font-medium text-sm transition-all whitespace-nowrap px-6 py-3 bg-[#102219] text-white hover:bg-[#1a3a2a]"
            >
              Subscribe
              <FiArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Privacy note */}
        <p className="flex items-center justify-center gap-2 text-xs sm:text-sm mt-5 text-[#4b5d50]">
          <GoShieldCheck className="w-4 h-4" />
          No spam. Only occasional updates.
        </p>

      </div>
    </section>
  );
}
