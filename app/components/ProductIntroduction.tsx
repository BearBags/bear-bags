import React from 'react';
import Image from 'next/image';
import { FiArrowRight } from 'react-icons/fi';
import { GiWaterDrop } from 'react-icons/gi';
import { PiPlantBold } from 'react-icons/pi';
import { FaRecycle } from 'react-icons/fa';
import { GiStrong } from 'react-icons/gi';
import { BiLeaf } from "react-icons/bi";
import { FaHandHoldingHeart } from "react-icons/fa6";
import { LiaHandHoldingHeartSolid } from "react-icons/lia";
import { LuShieldAlert, LuDroplet } from "react-icons/lu";

import Link from 'next/link';
import { getProductBySlug } from '@/lib/products';

import { LuShield } from "react-icons/lu";

function WaterShieldIcon({ size = 64 }: { size?: number }) {
  const dropletSize = size * 0.4375;
  return (
    <div style={{ position: 'relative', display: 'inline-block', width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
      <LuShield size={size} color="#23473f" style={{ position: 'absolute', top: 0, left: 0 }} />
      <LuDroplet size={dropletSize} color="#23473f" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -45%)' }} />
    </div>
  );
}


const ProductIntroduction = () => {
  const product = getProductBySlug('medium-size-bag');
  if (!product) return null;
  return (
    <section id='product' className="bg-[#fff9f3] px-3 sm:px-6 py-8 sm:py-10 md:py-16 flex justify-center pt-4 sm:pt-6 pb-2 sm:pb-4">
      <div className="w-full max-w-9xl bg-[#fff9f3] px-4 sm:px-10 py-6 sm:py-10 md:py-14">

        {/* TOP SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">

          {/* LEFT IMAGE */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-[280px] sm:max-w-[400px] md:max-w-[520px] lg:max-w-[750px] h-[240px] sm:h-[340px] md:h-[420px] lg:h-[520px]">
              <Image
                src={product.imageSrc}
                alt={product.imageAlt}
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="max-w-2xl">

            <p className="uppercase tracking-[2px] sm:tracking-[4px] text-[13px] sm:text-[15px] text-[#b98a52] font-semibold mb-4 sm:mb-5">
              Our Product
            </p>

            <h2 className="text-[1.75rem] sm:text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] leading-tight sm:leading-none font-semibold text-[#23473f] mb-3 sm:mb-4 font-serif">
              {product.title}
            </h2>

            <p className="text-[#5e5e5e] text-base sm:text-lg mb-4 sm:mb-5">
              {product.description} . {product.bagSize}
            </p>

            {/* <p className='mb-4 text-[#5f5f5f] flex items-center gap-[0.5rem]'>⭐️⭐️⭐️⭐️⭐️  {product.rating}  <span className='mb-[5px]'> . </span>  {product.orders}</p> */}

<div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <h3 className="text-[1.8rem] sm:text-[2.2rem] font-bold text-[#23473f]">
                ₹{product.price}
              </h3>
              <p className="text-[0.9rem] sm:text-[1rem] text-[#5e5e5e]">
                {product.perBag}
              </p>
            </div>

           {/* <p className='mb-4 text-[#2F6B4F] font-medium text-[1.2rem]'>
  {product.freeDelivery}
</p> */}


            <div className="border-t border-[#ddd2c2] pt-6 sm:pt-8 mb-6">
              <h4 className="text-[1.5rem] sm:text-[2rem] lg:text-[2.1rem] font-semibold text-[#23473f] mb-3 sm:mb-4 font-serif">
                {product.highlight}
              </h4>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[#5f5f5f] product-introduction-paragraph">
                <div className="flex items-center gap-2 font-bold">
                  {/* <PiPlantBold className="text-[#23473f]" /> */}
                  <span>CPCB Certified</span>
                </div>

                <span className="text-[#999]">•</span>

                <div className="flex items-center gap-2 font-bold">
                  {/* <GiStrong className="text-[#23473f]" /> */}
                  <span>TÜV Austria Certified</span>
                </div>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8">

              <Link href="/medium-size-bag" className="bg-[#23473f] hover:bg-[#1b3832] transition-all text-white h-[48px] sm:h-[54px] px-6 sm:px-8 rounded-lg flex items-center justify-center gap-3 text-[14px] sm:text-[15px] font-medium w-full sm:w-[300px]">
                Shop Now
                {/* <FiArrowRight size={18} /> */}
              </Link>

              {/* <button className="border border-[#23473f] text-[#23473f] h-[54px] px-8 rounded-lg text-[15px] font-medium hover:bg-[#23473f] hover:text-white transition-all w-full sm:w-[220px]">
                View Details
              </button> */}

            </div>

            {/* <h3 className='mt-4 text-[#5f5f5f]'>{product.inStock}</h3> */}
          </div>
        </div>

        {/* BOTTOM FEATURES */}
        <div className="mt-8 rounded-2xl border border-[#e8ddd0] bg-[#faf5ef] grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#e8ddd0]">

          {/* FEATURE 1 */}
          <div className="flex items-center gap-3 sm:gap-5 md:gap-6 px-4 sm:px-8 md:px-10 lg:px-14 py-3 sm:py-5 md:py-7">
            <BiLeaf className="text-[#23473f] shrink-0 w-[40px] h-[40px] sm:w-[52px] sm:h-[52px] md:w-[64px] md:h-[64px]" />
            <div>
              <h5 className="font-semibold text-[#23473f] text-[0.95rem] sm:text-[1.1rem] md:text-[1.3rem] lg:text-[1.4rem] leading-tight">
                100% Compostable
              </h5>
              <p className="text-[#666] mt-0.5 sm:mt-1 text-[0.8rem] sm:text-[0.9rem] md:text-[1rem] lg:text-[1.1rem]">
                No plastic. No microplastics.
              </p>
            </div>
          </div>

          {/* FEATURE 2 */}
          <div className="flex items-center gap-3 sm:gap-5 md:gap-6 px-4 sm:px-8 md:px-10 lg:px-14 py-3 sm:py-5 md:py-7">
            <div className="shrink-0 sm:hidden">
              <WaterShieldIcon size={40} />
            </div>
            <div className="shrink-0 hidden sm:block md:hidden">
              <WaterShieldIcon size={52} />
            </div>
            <div className="shrink-0 hidden md:block">
              <WaterShieldIcon size={64} />
            </div>
            <div>
              <h5 className="font-semibold text-[#23473f] text-[0.95rem] sm:text-[1.1rem] md:text-[1.3rem] lg:text-[1.4rem] leading-tight">
                No Leak. No Tear.
              </h5>
              <p className="text-[#666] mt-0.5 sm:mt-1 text-[0.8rem] sm:text-[0.9rem] md:text-[1rem] lg:text-[1.1rem]">
                Built for real use.
              </p>
            </div>
          </div>

          {/* FEATURE 3 */}
          <div className="flex items-center gap-3 sm:gap-5 md:gap-6 px-4 sm:px-8 md:px-10 lg:px-14 py-3 sm:py-5 md:py-7">
            <LiaHandHoldingHeartSolid className="text-[#23473f] shrink-0 w-[40px] h-[40px] sm:w-[52px] sm:h-[52px] md:w-[64px] md:h-[64px]" />
            <div>
              <h5 className="font-semibold text-[#23473f] text-[0.95rem] sm:text-[1.1rem] md:text-[1.3rem] lg:text-[1.4rem] leading-tight">
                30% profits pledged
              </h5>
              <p className="text-[#666] mt-0.5 sm:mt-1 text-[0.8rem] sm:text-[0.9rem] md:text-[1rem] lg:text-[1.1rem]">
                Supporting community development.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProductIntroduction;