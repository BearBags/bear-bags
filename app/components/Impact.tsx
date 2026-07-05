import React from "react";
import { PiLeafBold } from "react-icons/pi";
import { GoShieldCheck } from "react-icons/go";
import { LiaHandHoldingHeartSolid } from "react-icons/lia";
import { MdPeopleOutline } from "react-icons/md";
import { HiOutlineDocumentCheck } from "react-icons/hi2";
import { FaBuilding, FaChartBar } from "react-icons/fa6";
import { SlCalender } from "react-icons/sl";
import { BiLandscape } from "react-icons/bi";
import { HiOutlineBuildingLibrary } from "react-icons/hi2";
import Link from "next/link";

const Impact = () => {
  return (
    <section id="impact" className="w-full bg-gradient-to-b from-[#06261F] via-[#08332A] to-[#06261F] py-12 md:py-20 px-4 sm:px-6 text-white bg-[#173d36]">
      <div className="max-w-6xl mx-auto text-center">

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-3 font-serif">
          Built to give back.
        </h2>

 {/* Small Divider */}
<div className="flex items-center justify-center gap-3 mb-12">
  {/* Left line with smooth fade on both ends */}
  <div className="relative w-18 h-[1px] overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C8A45D] to-transparent" />
  </div>

  {/* Center icon */}
  <span className="text-[#C8A45D] text-lg">
    <PiLeafBold className="inline-block w-6 h-6" />
  </span>

  {/* Right line with smooth fade on both ends */}
  <div className="relative w-18 h-[1px] overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C8A45D] to-transparent" />
  </div>
</div>

        {/* Metric Cards */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          
          {/* Card 1 */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 sm:p-8 flex items-center text-left backdrop-blur-md bg-[#02362c7a] shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-[#C8A45D]/20 text-[#C8A45D] shrink-0">
                <LiaHandHoldingHeartSolid className="w-7 h-7 sm:w-10 sm:h-10" />
              </div>
              <div className="min-w-0">
                <h3 className="text-3xl sm:text-5xl font-semibold mb-1 sm:mb-2 font-serif">₹35,000</h3>
                <p className="text-xs sm:text-sm text-gray-300">contributed so far</p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 sm:p-8 flex items-center text-left backdrop-blur-md bg-[#02362c7a] shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-[#C8A45D]/20 text-[#C8A45D] shrink-0">
                <MdPeopleOutline className="w-7 h-7 sm:w-10 sm:h-10" />
              </div>
              <div className="min-w-0">
                <h3 className="text-3xl sm:text-5xl font-semibold mb-1 sm:mb-2 font-serif">30%</h3>
                <p className="text-xs sm:text-sm text-gray-300">
                  profits committed to community development
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* transparency note */}
        {/* <div className="flex items-center justify-center gap-2 text-gray-300 text-sm mb-10">
          <span className="text-[#C8A45D]">
            <GoShieldCheck className="inline-block w-5 h-5" />
          </span>
          Every contribution will be transparently documented.
        </div> */}

        {/* Button */}
        <Link href="/impact" className="inline-flex items-center justify-center gap-2 bg-[#C8A45D] hover:bg-[#b8934f] text-black font-medium px-8 sm:px-10 py-3 sm:py-4 rounded-full transition-colors w-full sm:w-auto sm:max-w-xs">
          View Impact
        </Link>

        {/* Footer line */}
<p className="mt-6 flex items-center justify-center gap-3 text-sm text-gray-400">
  {/* Left line with smooth fade */}
  <span className="relative h-[1px] w-12 overflow-hidden">
    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C8A45D] to-transparent" />
  </span>

  {/* Text */}
  <span>Real impact. Real transparency.</span>

  {/* Right line with smooth fade */}
  <span className="relative h-[1px] w-12 overflow-hidden">
    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C8A45D] to-transparent" />
  </span>
</p>

        {/* Bottom Feature Bar */}
<div className="mt-10 sm:mt-14">
  {/* Mobile Layout: 2x2 Grid */}
  <div className="sm:hidden">
    <div className="grid grid-cols-2 gap-4">
      {[
        {
          icon: <HiOutlineDocumentCheck className="w-8 h-8 text-[#C8A45D]" />,
          title: "Verified Receipts",
          description: "All contributions backed by real receipts.",
        },
        {
          icon: <HiOutlineBuildingLibrary className="w-8 h-8 text-[#C8A45D]" />,
          title: "Verified NGOs",
          description: "We support impact-driven Organizations.",
        },
        {
          icon: <BiLandscape className="w-8 h-8 text-[#C8A45D]" />,
          title: "On-Ground Impact",
          description: "Stories and photos from the communities.",
        },
        {
          icon: <SlCalender className="w-8 h-8 text-[#C8A45D]" />,
          title: "Impact Updates",
          description: "Shared as the journey grows.",
        },
      ].map((item, index) => (
        <div
          key={index}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/5 p-5 backdrop-blur-sm hover:border-white/20 hover:bg-white/10 transition-all duration-300 flex flex-col items-center text-center"
        >
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#C8A45D]/15 mb-4">
            {item.icon}
          </div>

          {/* Content */}
          <div>
            <h4 className="text-white font-semibold text-sm leading-tight mb-2">
              {item.title}
            </h4>
            <p className="text-xs leading-relaxed text-white/70">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Desktop Layout: Horizontal Bar */}
  <div className="hidden sm:block rounded-2xl border border-white/10 bg-[#02362c7a] px-4 sm:px-8 py-5 sm:py-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-0">
      {[
        {
          icon: <HiOutlineDocumentCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#C8A45D]" />,
          title: "Verified Receipts",
          description: "All contributions backed by real receipts.",
        },
        {
          icon: <HiOutlineBuildingLibrary className="w-6 h-6 sm:w-7 sm:h-7 text-[#C8A45D]" />,
          title: "Verified NGOs",
          description: "We support impact-driven Organizations.",
        },
        {
          icon: <BiLandscape className="w-6 h-6 sm:w-7 sm:h-7 text-[#C8A45D]" />,
          title: "On-Ground Impact",
          description: "Stories and photos from the communities.",
        },
        {
          icon: <SlCalender className="w-6 h-6 sm:w-7 sm:h-7 text-[#C8A45D]" />,
          title: "Impact Updates",
          description: "Shared as the journey grows.",
        },
      ].map((item, index) => (
        <div
          key={index}
          className={`flex items-start gap-3 sm:gap-4 px-2 sm:px-6 py-3 sm:py-2 ${
            index !== 3 ? "sm:border-r sm:border-white/10" : ""
          }`}
        >
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">{item.icon}</div>

          {/* Content */}
          <div className="min-w-0">
            <h4 className="text-white font-semibold text-sm sm:text-[15px] leading-tight">
              {item.title}
            </h4>
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-[13px] leading-5 text-white/70 max-w-[180px]">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
      </div>
    </section>
  );
};

export default Impact;