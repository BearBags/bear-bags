'use client'
import React, { useRef, useState } from 'react'
import Image from 'next/image';
import { LuLeaf } from "react-icons/lu";

const WhyBearBags = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

const togglePlay = () => {
  if (!videoRef.current) return;
  if (videoRef.current.paused) {
    videoRef.current.play();
    setIsPlaying(true);
  } else {
    videoRef.current.pause();
    setIsPlaying(false);
  }
};

  return (
    <section id="why" className="bg-[#fff9f3]">

{/* Strength Section */}
<section className="relative bg-[#f8f5ef] py-6 md:py-6 overflow-hidden">
  <div className="max-w-6xl mx-auto px-4 text-center">

    {/* Decorative divider */}
    {/* <div className="flex items-center justify-center gap-4">
      <div className="w-20 h-px bg-[#d6d3cc]" /> */}
      {/* <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="#8BB174"
      >
        <path d="M20.8 3.2c-6.4.3-10.8 2.7-13.1 7.1C6.4 12.8 6 15.5 6 18c0 .3 0 .6.1.9 2.6.1 5.3-.3 7.7-1.7 4.4-2.3 6.8-6.7 7.1-13z" />
      </svg> */}
      {/* <LuLeaf className="text-[#0d3b34] text-5xl" /> */}
      {/* <div className="w-20 h-px bg-[#d6d3cc]" />
    </div> */}

    {/* Heading */}
    <h2 className="font-['Playfair_Display'] text-[#0d3b34] text-4xl md:text-6xl font-bold leading-[1.05]">
      Strong by nature.
      <br />
      Not by plastic.
    </h2>

    {/* Subtitle */}
    <p className="mt-5 text-[#4d4d4d] text-base md:text-lg">
      Designed for real use
    </p>
  </div>

  {/* Full Width Image */}
  <div className="relative mt-[-0.5rem] sm:mt-[-3rem] md:mt-[-5rem] w-full">

<div className="relative w-full h-[180px] sm:h-[340px] md:h-[700px] overflow-hidden mt-[20px] sm:mt-[30px]">
  <div className="stretch-inner">
    <Image
      src="/images/Bag Stretch Image without backgorund 2.png"
      alt="No Leak. No Tear."
      fill
      priority
      className="object-contain"
    />
  </div>
</div>
  </div>
  <div className="absolute bottom-0 left-0 w-full leading-none">
  <svg
    viewBox="0 0 1440 120"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-auto block"
    preserveAspectRatio="none"
  >
    <path
      fill="#173d36"
      d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
    />
  </svg>
</div>
</section>
      

      {/* Video Block */}
      <div className="px-4 md:px-10 max-w-7xl mx-auto text-center mt-4">

        {/* Pill label */}
        <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-[#173d36] bg-[#fde8d0] px-4 py-1.5 rounded-full mb-5 mt-4 py-[0.5rem] px-[1rem]">
          See Bear Bags in action.
        </span>

        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#2c1a0e] leading-tight tracking-tight mb-6 mt-6">
          Tougher than{' '}
          <span className="text-[#173d36]">you think.</span>
        </h2>

        {/* Subtitle */}
        {/* <p className="text-base text-[#7a5c44] max-w-lg mx-auto leading-relaxed mb-16">
          Watch how Bear Bags handle real-world stress — stretching, soaking, and everything in between.
        </p> */}

        {/* Video container */}
        <div className="group relative rounded-2xl overflow-hidden border-2 border-[#f2d9c0] shadow-[0_20px_60px_rgba(181,101,29,0.15)] w-full aspect-[16/9] bg-[#173d36]">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-auto mx-auto rotate-270 scale-[1.8] object-cover"
          >
            <source src="/videos/Bear Bags_Unboxing.mp4" type="video/mp4" />
          </video>

          {/* Overlay on pause */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/30 transition-opacity duration-300" />
          )}

          {/* Play/Pause button — visible on hover or when paused */}
          <button
            onClick={togglePlay}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300
              ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            <div className="w-16 h-16 rounded-full bg-[#fff9f3]/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 hover:bg-white transition-all duration-200">
              {isPlaying ? (
                // Pause icon
                <svg className="w-6 h-6 text-[#173d36]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                // Play icon (offset slightly for optical centering)
                <svg className="w-6 h-6 text-[#173d36] translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
          </button>

          {/* Top-left corner accent */}
          <div className="absolute top-3 left-3 w-9 h-9 border-t-2 border-l-2 border-[#173d36] rounded-tl opacity-50 pointer-events-none" />

          {/* Bottom-right corner accent */}
          <div className="absolute bottom-3 right-3 w-9 h-9 border-b-2 border-r-2 border-[#173d36] rounded-br opacity-50 pointer-events-none" />
        </div>

      </div>

    </section>
  )
}

export default WhyBearBags


      {/* Image Block
      <div className="image-wrapper mb-8 md:mb-12 lg:mb-16 ">
        <div className="absolute inset-0 z-10 flex items-start justify-start p-4 md:p-8 lg:p-12 pt-12 md:pt-16 lg:pt-20">
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-['Playfair_Display'] leading-tight max-w-md">
            Built for real use.
          </h2>
        </div>
        <div className="stretch-inner">
          <Image
            src="/images/Bag Stretch Image without backgorund 2.png"
            alt="No Leak. No Tear."
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute bottom-0 left-0 w-full leading-none z-10">
          <svg
            viewBox="0 0 1440 120"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto block"
            preserveAspectRatio="none"
          >
            <path
              fill="#173d36"
              d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            />
          </svg>
        </div>
      </div> */}


    {/* <div className="relative w-full h-[220px] md:h-[350px] lg:h-[450px]">
      <Image
        src="/images/Bag Stretch Image without backgorund 2.png"
        alt="Bear Bags Stretch Test"
        fill
        priority
        className="object-contain"
      />
    </div> */}

            {/* <div className="stretch-inner">
          <Image
            src="/images/Bag Stretch Image without backgorund 2.png"
            alt="No Leak. No Tear."
            fill
            className="object-cover"
          />
        </div> */}