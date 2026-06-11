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
    <div className="grid lg:grid-cols-2 gap-12 items-center">

      {/* LEFT */}
      <div>
        <h1 className="leading-none font-black uppercase">
          <span className="block text-[#ece7df] text-6xl md:text-9xl lg:text-10xl font-extrabold">
            NO PLASTIC.
          </span>

          <span className="block italic text-[#9EE37D] text-6xl md:text-9xl lg:text-10xl mt-2 font-extrabold">
            ALL POWER.
          </span>
        </h1>

<p className="mt-8 text-white/85 text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed">
  Engineered for strength. Fully compostable.
</p>

        {/* Certifications */}
        {/* <div className="flex flex-wrap gap-6 mt-8 text-[#d7e9d2]">
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>CPCB Certified</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>TÜV Austria Industrial Compostable</span>
          </div>
        </div> */}

<div className="flex flex-wrap gap-8 mt-8">
  <div className="flex items-center gap-3 text-[#d7e9d2]">
    <BsPatchCheckFill className="text-[#8ED973] text-xl" />
    <span className="font-medium">CPCB Certified</span>
  </div>

  <div className="flex items-center gap-3 text-[#d7e9d2]">
    <BsPatchCheckFill className="text-[#8ED973] text-xl" />
    <span className="font-medium">
      TÜV Austria Industrial Compostable
    </span>
  </div>
</div>

        {/* Buttons */}
        <div className="flex gap-4 mt-10">
          <Link
            href="/medium-size-bag"
            className="bg-[#f4eee5] text-[#0d2f2b] px-8 py-4 rounded-xl font-semibold hover:scale-105 transition"
          >
            Shop Now 
          </Link>

          {/* <Link
            href="#why"
            className="border border-[#4b8f63] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#173d36] transition"
          >
            Why Bear Bags →
          </Link> */}
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative flex justify-center">

        <Image
          src="/images/2box_2Roll_White_ 2000 x 2000_px_without BG.png"
          width={900}
          height={700}
          alt="Bear Bags"
          priority
          className="
            max-w-[950px]
            drop-shadow-[0_40px_80px_rgba(0,0,0,0.55)]
            hover:scale-105
            transition-transform
            duration-500
          "
        />
      </div>
    </div>

    {/* Bottom Features Bar */}
    {/* <div className="mt-20 border-t border-white/10 pt-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white/90">

        <div>
          <p className="font-medium">CPCB Certified</p>
        </div>

        <div>
          <p className="font-medium">TÜV Austria Certified</p>
        </div>

        <div>
          <p className="font-medium">30% Profits Pledged</p>
        </div>

        <div>
          <p className="font-medium">Made in India</p>
        </div>

      </div>
    </div> */}
  </div>
</section>
  )
}

export default HeroSection