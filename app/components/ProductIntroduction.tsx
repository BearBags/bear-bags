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

function WaterShieldIcon() {
  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '50px', height: '50px' }}>
      {/* Outer Shield */}
      <LuShield size={50} color="#333" style={{ position: 'absolute', top: 0, left: 0 }} />
      {/* Inner Water Drop */}
      <LuDroplet size={22} color="#333" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -45%)' }} />
    </div>
  );
}


const ProductIntroduction = () => {
  const product = getProductBySlug('medium-size-bag');
  if (!product) return null;
  return (
    <section id='product' className="bg-[#fff9f3] px-4 sm:px-6 py-10 md:py-16 flex justify-center pt-6 pb-4">
      <div className="w-full max-w-9xl bg-[#fff9f3] px-6 sm:px-10 py-10 md:py-14">

        {/* TOP SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* LEFT IMAGE */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-[750px] h-[320px] sm:h-[400px] md:h-[520px]">
              <Image
                src={product.imageSrc}
                alt={product.imageAlt}
                fill
                priority
              />
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="max-w-2xl">

            <p className="uppercase tracking-[4px] text-[15px] text-[#b98a52] font-semibold mb-5 text-2xl">
              Our Product
            </p>

            <h2 className="text-[2.3rem] sm:text-[4rem] leading-none font-semibold text-[#23473f] mb-4 font-serif">
              {product.title}
            </h2>

            <p className="text-[#5e5e5e] text-lg mb-5">
              {product.description} . {product.bagSize}
            </p>

            <p className='mb-4 text-[#5f5f5f] flex items-center gap-[0.5rem]'>⭐️⭐️⭐️⭐️⭐️  {product.rating}  <span className='mb-[5px]'> . </span>  {product.orders}</p>

<div className="flex items-center gap-4 mb-8">
              <h3 className="text-[2.2rem] font-bold text-[#23473f]">
                ₹{product.price}
              </h3>
              <p className="text-[1rem] mt-[0.5rem] text-[#5e5e5e]">
                {product.perBag}
              </p>
            </div>

           <p className='mb-4 text-[#2F6B4F] font-medium text-[1.2rem]'>
  {product.freeDelivery}
</p>


            <div className="border-t border-[#ddd2c2] pt-8 mb-6">
              <h4 className="text-[2rem] sm:text-[2.1rem] font-semibold text-[#23473f] mb-4 font-serif">
                {product.highlight}
              </h4>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[#5f5f5f] product-introduction-paragraph">
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
            <div className="flex flex-col sm:flex-row gap-4 pt-8">

              <Link href="/medium-size-bag" className="bg-[#23473f] hover:bg-[#1b3832] transition-all text-white h-[54px] px-8 rounded-lg flex items-center justify-center gap-3 text-[15px] font-medium w-full sm:w-[300px]">
                Shop Now
                {/* <FiArrowRight size={18} /> */}
              </Link>

              {/* <button className="border border-[#23473f] text-[#23473f] h-[54px] px-8 rounded-lg text-[15px] font-medium hover:bg-[#23473f] hover:text-white transition-all w-full sm:w-[220px]">
                View Details
              </button> */}

            </div>

            <h3 className='mt-4 text-[#5f5f5f]'>{product.inStock}</h3>
          </div>
        </div>

        {/* BOTTOM FEATURES */}
        <div className=" mt-12 pt-8 grid grid-cols-2 md:grid-cols-3 gap-8">

          {/* FEATURE 1 */}
          <div className="flex items-start gap-3 product-introduction-card">
            {/* <PiPlantBold className="text-[#23473f] text-2xl mt-1" /> */}
              <BiLeaf className="text-[#23473f] text-2xl mt-1 w-[50px] h-[50px]" />
            <div>
              <h5 className="text-sm font-semibold text-[#23473f] text-[1.3rem]">
                100% Compostable
              </h5>
              <p className="text-xs text-[#666] mt-1 text-[1.1rem]">
                No plastic, No microplastics.
              </p>
            </div>
          </div>

          {/* FEATURE 2 */}
          <div className="flex items-start gap-3 product-introduction-card">
            {/* <GiWaterDrop className="text-[#23473f] text-2xl mt-1" /> */}
            {WaterShieldIcon()}
            <div>
              <h5 className="text-sm font-semibold text-[#23473f] text-[1.3rem]">
                No Leak. No Tear.
              </h5>
              <p className="text-xs text-[#666] mt-1 text-[1.1rem]">
                Built for real use.
              </p>
            </div>
          </div>

          {/* FEATURE 3 */}
          {/* <div className="flex items-start gap-3 product-introduction-card">
            <FaRecycle className="text-[#23473f] text-2xl mt-1" />
            <div>
              <h5 className="text-sm font-semibold text-[#23473f] text-[1.3rem]">
                Made from Corn Starch
              </h5>
              <p className="text-xs text-[#666] mt-1 text-[1.1rem]">
                Better for you, better for Earth
              </p>
            </div>
          </div> */}

          {/* FEATURE 4 */}
          <div className="flex items-start gap-3 product-introduction-card">
            {/* <GiStrong className="text-[#23473f] text-2xl mt-1" /> */}
            <LiaHandHoldingHeartSolid className="text-[#23473f] text-2xl mt-1 w-[50px] h-[50px]" />
            <div>
              <h5 className="text-sm font-semibold text-[#23473f] text-[1.3rem]">
                30% Giveback
              </h5>
              <p className="text-xs text-[#666] mt-1 font-medium text-[1.1rem]">
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