'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Contribution } from '@/lib/contribution-format';
import ContributionsTable from './ContributionsTable';
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const letters = [
  {
    name: 'Gnana Jyothi Trust for the Disabled',
    image: '/images/acknowledgment/Gnana Jyothi Trust_Acknowledgement Letter.jpeg',
    pdf: '/images/acknowledgment/Gnana Jyothi Trust_Acknowledgement Letter.jpeg',
    website: 'https://gnanajyothi.org/',
    description: 'Founded in 2005 by two visually impaired individuals, Gnana Jyothi Trust runs Sai Sadhan, a hostel for blind girls in Bengaluru, supporting their education and independence.',
    details: [
      { label: 'Our contribution', value: '₹20,000 · May 2026' },
      { label: 'What it funded', value: 'Welfare of the blind students living at the trust’s hostel.' },
    ],
    images: [
      '/images/gnanaJyothiNGO/gnana_jyothi_1.jpg',
      '/images/gnanaJyothiNGO/gnana_jyothi_2.jpg',
      '/images/gnanaJyothiNGO/gnana_jyothi_3.jpg',
      '/images/gnanaJyothiNGO/gnana_jyothi_4.jpg',
    ],
  },
  {
    name: 'Samarthanam Trust for the Disabled',
    image: '/images/acknowledgment/Samarthanam Acknowledgment Letter Screenshot.png',
    pdf: '/images/acknowledgment/Samarthanam Acknowledgment Letter Screenshot.png',
    website: 'https://samarthanam.org/',
    description: 'Samarthanam empowers people with visual impairments and other disabilities through education, livelihood and sports.',
    details: [
      { label: 'Our contribution', value: '₹15,000 · October 2025' },
      { label: 'What it funded', value: 'Livelihood skills training for one student under Samarthanam’s Skilling and Livelihood Program' },
      { label: 'Student funded', value: 'Nikil Gupanni, 19 · Hearing impaired · Dharwad, Karnataka' },
    ],
    images: [] as string[],
  },
];

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export default function ImpactView({ contributions }: { contributions: Contribution[] }) {
  const [selected, setSelected] = useState<{ letter: (typeof letters)[0]; mode: 'letter' | 'gallery' } | null>(null);
  const [gallerySwiper, setGallerySwiper] = useState<SwiperInstance | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    if (selected) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selected]);

  return (
    <main className="bg-[#f5f2eb] text-[#1a3d2b]">

      {/* ── Hero ── */}
      {/* Split layout: text on the left, photo on the right; photo stacks on top on mobile */}
      <section className="grid md:grid-cols-2 md:min-h-[70vh] bg-[#18302a]">
        <div className="relative h-[350px] sm:h-[440px] md:h-auto md:order-2">
          <Image
            src="/images/6_promotion.jpg"
            alt="Bear Bags boxes stacked in a pyramid outdoors"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            loading="eager"
            fetchPriority="high"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center px-5 sm:px-10 lg:px-20 py-8 sm:py-14 md:py-14 md:order-1">
          <p className="uppercase tracking-[0.2em] text-[#9fb8a6] text-xs font-semibold mb-5 sm:mb-6">
            Our Impact
          </p>
          <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl lg:text-[64px] font-bold text-white leading-[1.08] mb-5 sm:mb-7">
            Business should
            <br />
            benefit everyone.
          </h1>
          <p className="text-[#d6e0d9] text-base sm:text-lg max-w-[480px] leading-relaxed">
            A business is part of society, so its success should be shared with customers, employees and the community
            around it. That&rsquo;s not charity. It&rsquo;s how we think business should work.
          </p>
          <a
            href="#contributions"
            className="mt-20 md:mt-14 inline-flex items-center gap-2 self-start text-sm sm:text-base font-semibold text-[#d9b56a] hover:text-[#ecd08f] transition-colors"
          >
            See contributions <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

         {/* ── NGO Acknowledgements ── */}
      <section className="py-20 sm:py-28 px-6 md:px-10 bg-[#f5f2eb]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="uppercase tracking-[0.18em] text-xs font-semibold text-[#2d6347] mb-3">Recognition</p>
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#1a3d2b] mb-3">
              NGO Acknowledgements
            </h2>
            <p className="text-[#1a3d2b]/50 max-w-sm mx-auto text-sm sm:text-base">
              Letters received from our partner organizations
            </p>
          </div>

          {/* auto-rows-fr gives every card the same height on tablet and up */}
          <div className="grid gap-6 sm:auto-rows-fr">
            {letters.map((letter) => (
              <div
                key={letter.name}
                className="bg-white rounded-3xl border border-[#1a3d2b]/8 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row"
              >
                {/* Letter image — left panel */}
                <button
                  onClick={() => setSelected({ letter, mode: 'letter' })}
                  className="relative sm:w-[34%] shrink-0 h-[220px] sm:h-auto sm:min-h-[340px] bg-[#edf4e8] group overflow-hidden flex items-center justify-center p-4"
                  aria-label={`View ${letter.name} letter`}
                >
                  {/* Same-shaped frame for every letter, so scans with different
                      proportions show at the same size */}
                  <div className="relative h-full aspect-[3/4] shadow-sm transition-transform duration-500 group-hover:scale-[1.03]">
                    <Image
                      src={letter.image}
                      alt={`${letter.name} acknowledgement letter`}
                      fill
                      sizes="(min-width: 640px) 280px, 170px"
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="absolute inset-0 bg-[#1a3d2b]/0 group-hover:bg-[#1a3d2b]/20 transition-all duration-300" />
                </button>

                {/* Right content panel */}
                <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between gap-4">
                  <div>
                    {/* Name + website */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-lg sm:text-xl font-bold text-[#1a3d2b] leading-snug">{letter.name}</h3>
                      <a
                        href={letter.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-[#2d6347] hover:text-[#1a3d2b] transition-colors border border-[#2d6347]/30 rounded-full px-3 py-1.5 hover:border-[#1a3d2b]/50"
                      >
                        Website
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M7 17L17 7" /><path d="M7 7h10v10" />
                        </svg>
                      </a>
                    </div>
                    <p className="text-sm sm:text-[15px] leading-relaxed text-[#1a3d2b]/55">{letter.description}</p>
                    {letter.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {letter.images.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setSelected({ letter, mode: 'gallery' })}
                            className="relative h-14 w-[74px] sm:h-16 sm:w-[88px] rounded-lg overflow-hidden ring-1 ring-[#1a3d2b]/10 hover:ring-[#1a3d2b]/40 transition-all hover:scale-[1.03]"
                            aria-label="View gallery"
                          >
                            <Image src={img} alt="" fill sizes="88px" className="object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contribution details */}
                  <dl className="flex flex-col gap-2">
                    {letter.details.map((detail) => (
                      <div key={detail.label}>
                        <dt className="text-[11px] uppercase tracking-wider text-[#2d6347] font-semibold mb-0.5">{detail.label}</dt>
                        <dd className="text-sm sm:text-[15px] leading-relaxed text-[#1a3d2b] font-medium">{detail.value}</dd>
                      </div>
                    ))}
                  </dl>

                  {/* Actions */}
                  <div className="flex gap-3 flex-wrap items-center">
                    <button
                      onClick={() => setSelected({ letter, mode: 'letter' })}
                      className="px-5 py-2.5 rounded-full border-2 border-[#1a3d2b] text-sm font-semibold text-[#1a3d2b] hover:bg-[#1a3d2b] hover:text-white transition-all duration-200"
                    >
                      View Letter
                    </button>
                    <a
                      href={letter.pdf}
                      download
                      className="px-5 py-2.5 rounded-full bg-[#1a3d2b] text-white text-sm font-semibold hover:bg-[#245038] transition-all duration-200 flex items-center gap-2"
                    >
                      <DownloadIcon />
                      Download PDF
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm sm:text-base text-[#1a3d2b]/60">
            All contributions are made through <span className="font-semibold text-[#1a3d2b]">Eye of Arjuna</span>, the company behind Bear Bags.
          </p>
        </div>
      </section>

      {/* ── Contributions ── */}
      {contributions.length > 0 && (
        <section id="contributions" className="scroll-mt-24 pb-8 sm:pb-10 px-6 md:px-10 bg-[#f5f2eb]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <p className="uppercase tracking-[0.18em] text-xs font-semibold text-[#2d6347] mb-3">Transparency</p>
              <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#1a3d2b] mb-3">
                Every Contribution
              </h2>
              <p className="text-[#1a3d2b]/50 max-w-sm mx-auto text-sm sm:text-base">
                Where the money went, with a receipt for each
              </p>
            </div>
            <ContributionsTable contributions={contributions} />
          </div>
        </section>
      )}

      {/* ── Journey Collage ── */}
      <section className="bg-[#f5f2eb] pt-8 sm:pt-10 pb-20 sm:pb-28 px-6 md:px-16 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 sm:mb-20">
            <p className="uppercase tracking-[0.18em] text-xs font-semibold text-[#2d6347] mb-3">
              From Idea to Impact
            </p>
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a3d2b]">
              Our Journey So Far
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14">
            {[
              { src: '/images/1_prototype.jpg', caption: '1. First Prototype', rotate: '-rotate-2' },
              { src: '/images/impact/impact3.jpg', caption: '2. First Production ', rotate: '-rotate-1' },
              { src: '/images/impact/impact4.jpg', caption: '3. First Dispatch ', rotate: 'rotate-2' },
              { src: '/images/impact/impact5.png', caption: '4. Launched on Amazon ', rotate: 'rotate-1' },
              { src: '/images/impact/impact6.png', caption: '5. Taking Bear Bags Offline ', rotate: '-rotate-2' },
              { src: '/images/impact/impact7.jpg', caption: '6. First Retail Store ', rotate: 'rotate-1' },
              { src: '/images/impact/impact8.jpg', caption: '7. On the Shelves', rotate: '-rotate-1' },
              { src: '/images/impact/impact9.jpg', caption: '8. Giving Back', rotate: 'rotate-2' },
              { src: '/images/impact/impact10-blinkit.jpg', caption: '9. Launched on Blinkit', rotate: '-rotate-2' },
            ].map((item) => (
              <div key={item.caption} className={`relative ${item.rotate} transition-transform duration-300 hover:rotate-0 hover:scale-[1.03]`}>
                <div className="bg-white p-2.5 pb-8 shadow-lg rounded-sm">
                  <div className="relative aspect-square overflow-hidden">
                    <Image src={item.src} alt={item.caption} fill className="object-cover" />
                  </div>
                </div>
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rotate-1 bg-[#f3e9d2]/90 text-[#1a3d2b] text-[11px] sm:text-xs font-semibold px-3 py-1 shadow-sm whitespace-nowrap">
                  {item.caption}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      {/* <section className="bg-[#edf4e8] py-20 sm:py-28 px-6 md:px-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="relative aspect-[4/3] sm:aspect-square rounded-3xl overflow-hidden shadow-xl order-2 md:order-1">
            <Image src="/images/about-impact.jpg" alt="Bear Bags Story" fill className="object-cover" />
          </div>
          <div className="order-1 md:order-2">
            <span className="uppercase tracking-[0.16em] text-xs font-semibold text-[#2d6347] block mb-3">
              The Bear Bags Story
            </span>
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold mb-6 text-[#1a3d2b] leading-snug">
              Born in the Wild,<br />Engineered for Earth.
            </h2>
            <p className="text-[#1a3d2b]/60 leading-relaxed mb-4 text-[15px] sm:text-[17px]">
              What started as a simple observation became a mission to reduce plastic pollution through sustainable innovation.
            </p>
            <p className="text-[#1a3d2b]/60 leading-relaxed text-[15px] sm:text-[17px]">
              Every Bear Bag contributes toward cleaner communities and a healthier planet.
            </p>
          </div>
        </div>
      </section> */}

   

      {/* ── NGO Partners ── */}
      {/* <section className="bg-[#f5f2eb] py-20 sm:py-28 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="uppercase tracking-[0.18em] text-xs font-semibold text-[#8fc4a0] mb-3">Collaboration</p>
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-white mb-3">
              NGOs With Us
            </h2>
            <p className="text-[#c8dbbf]/55 max-w-sm mx-auto text-sm sm:text-base">
              Our greatest tool is working together
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {ngoPartners.map((partner) => (
              <div
                key={partner}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 text-center hover:bg-white/10 transition-colors duration-200 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#c8dbbf]/10 group-hover:bg-[#c8dbbf]/20 transition-colors flex items-center justify-center mx-auto mb-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8dbbf" strokeWidth="1.7" strokeLinecap="round">
                    <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10A15 15 0 0 1 8 12a15 15 0 0 1 4-10z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-sm sm:text-[15px] leading-snug">{partner}</h3>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── Lightbox ── */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 sm:px-8 py-4 sm:py-5 border-b border-[#1a3d2b]/10 shrink-0">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#2d6347] font-semibold mb-0.5">
                  {selected.mode === 'letter' ? 'Acknowledgement Letter' : 'NGO Gallery'}
                </p>
                <h3 className="text-lg sm:text-xl font-bold text-[#1a3d2b]">{selected.letter.name}</h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="w-9 h-9 rounded-full border border-[#1a3d2b]/20 flex items-center justify-center text-[#1a3d2b] hover:bg-[#e8f0e3] transition shrink-0"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {selected.mode === 'letter' ? (
                <div className="relative h-[55vh] sm:h-[62vh] bg-[#f8f8f5]">
                  <Image
                    src={selected.letter.image}
                    alt={`${selected.letter.name} acknowledgement letter`}
                    fill
                    className="object-contain"
                  />
                  <div className="absolute bottom-4 right-4 flex gap-3">
                    <a
                      href={selected.letter.pdf}
                      download
                      className="px-4 sm:px-5 py-2.5 rounded-full bg-[#1a3d2b] text-white text-sm font-semibold hover:bg-[#245038] transition flex items-center gap-2 shadow-lg"
                    >
                      <DownloadIcon />
                      Download
                    </a>
                    {selected.letter.images.length > 0 && (
                      <button
                        onClick={() => setSelected({ letter: selected.letter, mode: 'gallery' })}
                        className="px-4 sm:px-5 py-2.5 rounded-full bg-white border border-[#1a3d2b]/15 text-[#1a3d2b] text-sm font-semibold hover:bg-[#e8f0e3] transition shadow-lg"
                      >
                        View Gallery
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative h-[55vh] sm:h-[62vh]">
                  <Swiper
                    modules={[Pagination]}
                    pagination={{ clickable: true }}
                    loop
                    onSwiper={setGallerySwiper}
                    className="h-full"
                    style={{
                      '--swiper-pagination-color': '#fff',
                      '--swiper-pagination-bullet-inactive-color': '#fff',
                      '--swiper-pagination-bullet-inactive-opacity': '0.5',
                      '--swiper-pagination-bottom': '16px',
                    } as React.CSSProperties}
                  >
                    {selected.letter.images.map((img, i) => (
                      <SwiperSlide key={i}>
                        <div className="relative w-full h-full">
                          <Image
                            src={img}
                            alt={`${selected.letter.name} image ${i + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  <button
                    onClick={() => gallerySwiper?.slidePrev()}
                    aria-label="Previous image"
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 text-[#1a3d2b] shadow-lg flex items-center justify-center hover:bg-white hover:scale-105 transition"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => gallerySwiper?.slideNext()}
                    aria-label="Next image"
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 text-[#1a3d2b] shadow-lg flex items-center justify-center hover:bg-white hover:scale-105 transition"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
