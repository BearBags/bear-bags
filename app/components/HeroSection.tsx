import React from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { BsPatchCheckFill } from "react-icons/bs";

const HeroSection = () => {
  return (
<section
  id="home"
  className="relative overflow-hidden bg-[#0c2f2a] min-h-[85vh] flex items-center"
>
  {/* Background glow */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(34,197,94,0.25),transparent_45%)]" />
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(34,197,94,0.12),transparent_40%)]" />

  <div className="relative z-10 w-full">
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

      {/* LEFT */}
      <div>
        <h1 className="leading-none font-black uppercase">
          <span className="block text-[#ece7df] text-5xl sm:text-7xl md:text-8xl font-extrabold">
            NO PLASTIC.
          </span>

          <span className="block italic text-[#9ADDA9] text-5xl sm:text-7xl md:text-8xl mt-2 font-extrabold">
            ALL POWER.
          </span>
        </h1>

        <p className="mt-6 text-white/85 text-base sm:text-xl lg:text-2xl font-medium leading-relaxed">
          Engineered for strength. Fully compostable.
        </p>

        <div className="flex flex-wrap gap-4 sm:gap-8 mt-6 sm:mt-8">
          <div className="flex items-center gap-3 text-[#d7e9d2]">
            <BsPatchCheckFill className="text-[#9ADDA9] text-lg sm:text-xl shrink-0" />
            <span className="font-medium text-sm sm:text-base">CPCB Certified</span>
          </div>

          <div className="flex items-center gap-3 text-[#d7e9d2]">
            <BsPatchCheckFill className="text-[#9ADDA9] text-lg sm:text-xl shrink-0" />
            <span className="font-medium text-sm sm:text-base">TÜV Austria Industrial Compostable</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-8 sm:mt-10">
          <Link
            href="/medium-size-bag"
            className="bg-[#f4eee5] text-[#0d2f2b] px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold hover:scale-105 transition"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative flex justify-center mt-4 lg:mt-0">
        <Image
          src="/images/2box_2Roll_White_ 2000 x 2000_px_without BG.png"
          width={900}
          height={700}
          alt="Bear Bags"
          priority
          className="w-full max-w-[300px] sm:max-w-[460px] lg:max-w-[1200px] drop-shadow-[0_40px_80px_rgba(0,0,0,0.55)] hover:scale-105 transition-transform duration-500"
        />
      </div>
    </div>
  </div>
</section>
  )
}

export default HeroSection
