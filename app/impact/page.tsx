// app/impact/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const letters = [
  {
    name: 'Gnana Jyothi Trust',
    image: '/images/acknowledgment/Gnana Jyothi Trust_Acknowledgement Letter.jpeg',
    pdf: '/images/acknowledgment/Gnana Jyothi Trust_Acknowledgement Letter.jpeg',
    website: 'https://gnanajyothi.org/',
    description: 'Established in 2005 by two visually impaired individuals, deeply committed to empowering blind individuals through education and independence.',
    images: [
      '/images/gnanaJyothiNGO/gnana_jyothi_1.jpg',
      '/images/gnanaJyothiNGO/gnana_jyothi_2.jpg',
      '/images/gnanaJyothiNGO/gnana_jyothi_3.jpg',
      '/images/gnanaJyothiNGO/gnana_jyothi_4.jpg',
    ],
  },
  {
    name: 'Samarthanam Trust',
    image: '/images/acknowledgment/Samarthanam Acknowledgment Letter Screenshot.png',
    pdf: '/images/acknowledgment/Samarthanam Acknowledgment Letter Screenshot.png',
    website: 'https://samarthanam.org/',
    description: 'A prominent NGO dedicated to empowering individuals with visual impairments and other disabilities through education, livelihood, and sports.',
    images: [
      '/images/gnanaJyothiNGO/gnana_jyothi_1.jpg',
      '/images/gnanaJyothiNGO/gnana_jyothi_2.jpg',
      '/images/gnanaJyothiNGO/gnana_jyothi_3.jpg',
      '/images/gnanaJyothiNGO/gnana_jyothi_4.jpg',
    ],
  },
];

const stats = [
  { num: '2.4M', label: 'Lbs Plastic Removed' },
  { num: '12K+', label: 'Families Served' },
  { num: '4', label: 'NGO Partners' },
];

const ngoPartners = ['Ocean Cleanup', 'Green Earth Alliance', 'Global Reach', 'Eco Lab'];

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export default function ImpactPage() {
  const [selected, setSelected] = useState<{ letter: (typeof letters)[0]; mode: 'letter' | 'gallery' } | null>(null);

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
      <section className="relative overflow-hidden min-h-[85vh] flex items-center px-6 md:px-16 py-24">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/vides/impact_page_unboxing_video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d2619]/85 via-[#1a3d2b]/70 to-[#0b1f11]/80" />

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="max-w-2xl">
            <p className="uppercase tracking-[0.18em] text-[#8fc4a0] text-xs font-semibold mb-5">
              Making a Difference
            </p>
            <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6">
              Our Impact.
              <br />
              <span className="text-[#c8dbbf]">Their Future.</span>
            </h1>
            <p className="text-[#c8dbbf]/75 text-base sm:text-lg max-w-lg mb-12 leading-relaxed">
              We are on a mission to eliminate plastic waste and create a cleaner future through sustainable alternatives.
            </p>

            <div className="flex gap-3 sm:gap-4 flex-wrap">
              {stats.map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 sm:px-6 py-4 min-w-[110px]">
                  <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{s.num}</div>
                  <div className="uppercase tracking-wider text-[10px] text-[#c8dbbf]/80 mt-1 font-medium leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="bg-[#edf4e8] py-20 sm:py-28 px-6 md:px-16">
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
      </section>

      {/* ── NGO Acknowledgements ── */}
      <section className="py-20 sm:py-28 px-6 md:px-16 bg-[#f5f2eb]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="uppercase tracking-[0.18em] text-xs font-semibold text-[#2d6347] mb-3">Recognition</p>
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#1a3d2b] mb-3">
              NGO Acknowledgements
            </h2>
            <p className="text-[#1a3d2b]/50 max-w-sm mx-auto text-sm sm:text-base">
              Letters received from our partner organizations
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {letters.map((letter) => (
              <div
                key={letter.name}
                className="bg-white rounded-3xl border border-[#1a3d2b]/8 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row"
              >
                {/* Letter image — left panel */}
                <button
                  onClick={() => setSelected({ letter, mode: 'letter' })}
                  className="relative sm:w-[42%] shrink-0 h-[240px] sm:h-auto bg-[#edf4e8] group overflow-hidden text-left"
                  aria-label={`View ${letter.name} letter`}
                >
                  <Image
                    src={letter.image}
                    alt={`${letter.name} acknowledgement letter`}
                    fill
                    className="object-contain p-5 sm:p-6 transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-[#1a3d2b]/0 group-hover:bg-[#1a3d2b]/20 transition-all duration-300 flex items-end justify-start p-5">
                    <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 bg-white/95 text-[#1a3d2b] text-xs font-semibold px-4 py-2 rounded-full shadow-md">
                      View Letter ↗
                    </span>
                  </div>
                </button>

                {/* Right content panel */}
                <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between gap-6">
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
                  </div>

                  {/* Photo thumbnails */}
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#2d6347] font-semibold mb-2.5">Gallery</p>
                    <div className="flex gap-2">
                      {letter.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setSelected({ letter, mode: 'gallery' })}
                          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 ring-1 ring-[#1a3d2b]/10 hover:ring-[#1a3d2b]/40 transition-all hover:scale-105"
                          aria-label="View gallery"
                        >
                          <Image src={img} alt="" fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 flex-wrap">
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
        </div>
      </section>

      {/* ── NGO Partners ── */}
      <section className="bg-[#1a3d2b] py-20 sm:py-28 px-6 md:px-16">
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
      </section>

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
                    <button
                      onClick={() => setSelected({ letter: selected.letter, mode: 'gallery' })}
                      className="px-4 sm:px-5 py-2.5 rounded-full bg-white border border-[#1a3d2b]/15 text-[#1a3d2b] text-sm font-semibold hover:bg-[#e8f0e3] transition shadow-lg"
                    >
                      View Gallery
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-[55vh] sm:h-[62vh]">
                  <Swiper
                    modules={[Navigation, Pagination]}
                    navigation
                    pagination={{ clickable: true }}
                    loop
                    className="h-full"
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
