// app/impact/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const letters = [
  {
    name: 'Gnana Jyothi Trust',
    image: '/images/acknowledgment/Gnana Jyothi Trust_Acknowledgement Letter.jpeg',
    pdf: '/images/acknowledgment/Gnana Jyothi Trust_Acknowledgement Letter.jpeg',
  },
  {
    name: 'Samarthanam Trust',
    image: '/images/acknowledgment/Samarthanam Acknowledgment Letter Screenshot.png',
    pdf: '/images/acknowledgment/Samarthanam Acknowledgment Letter Screenshot.png',
  },
];

const ngoPartners = ['Ocean Cleanup', 'Green Earth Alliance', 'Global Reach', 'Eco Lab'];

export default function ImpactPage() {
  const [selected, setSelected] = useState<(typeof letters)[0] | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    if (selected) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selected]);

  return (
    <main className="bg-[#f5f2eb] text-[#1a3d2b]">

      {/* ── Hero ── */}
      <section className="bg-[#1a3d2b] pt-40 pb-28 px-6 md:px-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <p className="uppercase tracking-[0.14em] text-[#c8dbbf] text-xs font-sans mb-4 opacity-80">
              Our Impact
            </p>
            <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight mb-6">
              Our Impact.
              <br />
              <span className="text-[#c8dbbf]">Their Future.</span>
            </h1>
            <p className="font-sans text-[#c8dbbf]/70 text-lg max-w-lg mb-12 leading-relaxed">
              We are on a mission to eliminate plastic waste and create a
              cleaner future through sustainable alternatives.
            </p>
            {/* Stats row */}
            <div className="flex gap-4 flex-wrap">
              {[
                { num: '2.4M', label: 'Lbs Plastic Removed' },
                { num: '12K+', label: 'Families Served' },
                { num: '4', label: 'NGO Partners' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white/5 border border-[#c8dbbf]/20 rounded-2xl px-6 py-4 min-w-[120px]"
                >
                  <div className="text-3xl font-bold text-white">{s.num}</div>
                  <div className="uppercase tracking-wider text-[10px] font-sans text-[#c8dbbf] mt-1 opacity-75">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block md:col-span-5">
            <div className="relative h-[520px] rounded-3xl overflow-hidden">
              <Image
                src="/images/impact-hero.jpg"
                alt="Forest"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="bg-[#e8f0e3] py-28 px-6 md:px-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div className="relative aspect-square rounded-3xl overflow-hidden">
            <Image
              src="/images/about-impact.jpg"
              alt="Bear Bags Story"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="uppercase tracking-[0.14em] text-xs font-sans text-[#2d6347]">
              The Bear Bags Story
            </span>
            <h2 className="text-4xl font-bold mt-3 mb-6 text-[#1a3d2b] leading-snug">
              Born in the Wild,<br />Engineered for Earth.
            </h2>
            <p className="font-sans text-[#1a3d2b]/60 leading-relaxed mb-4">
              What started as a simple observation became a mission to reduce
              plastic pollution through sustainable innovation.
            </p>
            <p className="font-sans text-[#1a3d2b]/60 leading-relaxed">
              Every Bear Bag contributes toward cleaner communities and a
              healthier planet.
            </p>
          </div>
        </div>
      </section>

      {/* ── NGO Acknowledgements ── */}
      <section className="py-28 px-6 md:px-16 bg-[#f5f2eb]">
        <div className="max-w-7xl mx-auto">
          <p className="uppercase tracking-[0.14em] text-xs font-sans text-[#2d6347] text-center mb-3">
            Recognition
          </p>
          <h2 className="text-4xl font-bold text-center text-[#1a3d2b] mb-4">
            NGO Acknowledgements
          </h2>
          <p className="text-center font-sans text-[#1a3d2b]/55 mb-16">
            Letters received from our partner organizations.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {letters.map((letter) => (
              <div
                key={letter.name}
                className="bg-white rounded-3xl border border-[#1a3d2b]/10 overflow-hidden"
              >
                {/* Image / clickable area */}
                <button
                  onClick={() => setSelected(letter)}
                  className="relative w-full h-[400px] group block"
                  aria-label={`View ${letter.name} acknowledgement letter`}
                >
                  <Image
                    src={letter.image}
                    alt={`${letter.name} acknowledgement letter`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-[#1a3d2b]/0 group-hover:bg-[#1a3d2b]/30 transition-all duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 bg-white text-[#1a3d2b] text-sm font-semibold font-sans px-6 py-2.5 rounded-full flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg>
                      View Letter
                    </span>
                  </div>
                </button>

                <div className="p-7">
                  <h3 className="font-sans text-lg font-semibold text-[#1a3d2b] mb-5">
                    {letter.name}
                  </h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelected(letter)}
                      className="px-5 py-2.5 rounded-full border-2 border-[#1a3d2b] font-sans text-sm font-semibold text-[#1a3d2b] hover:bg-[#1a3d2b] hover:text-white transition-all duration-200"
                    >
                      View Letter
                    </button>
                    
                    <a
                      href={letter.pdf}
                      download
                      className="px-5 py-2.5 rounded-full bg-[#1a3d2b] text-white font-sans text-sm font-semibold hover:bg-[#245038] transition-all duration-200 flex items-center gap-2"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
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
      <section className="bg-[#e8f0e3] py-28 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <p className="uppercase tracking-[0.14em] text-xs font-sans text-[#2d6347] text-center mb-3">
            Collaboration
          </p>
          <h2 className="text-4xl font-bold text-center text-[#1a3d2b] mb-4">
            NGOs With Us
          </h2>
          <p className="text-center font-sans text-[#1a3d2b]/55 mb-16">
            Our greatest tool is working together.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {ngoPartners.map((partner) => (
              <div
                key={partner}
                className="bg-white border border-[#1a3d2b]/10 rounded-2xl p-8 text-center"
              >
                <h3 className="font-sans font-semibold text-[#1a3d2b]">{partner}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lightbox ── */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-[#1a3d2b]/10">
              <h3 className="font-sans font-semibold text-[#1a3d2b]">
                {selected.name} — Acknowledgement Letter
              </h3>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="w-9 h-9 rounded-full border border-[#1a3d2b]/20 flex items-center justify-center text-[#1a3d2b] hover:bg-[#e8f0e3] transition"
              >
                ✕
              </button>
            </div>

            {/* Image */}
            <div className="relative w-full h-[70vh]">
              <Image
                src={selected.image}
                alt={`${selected.name} acknowledgement letter`}
                fill
                className="object-contain"
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end px-7 py-5 border-t border-[#1a3d2b]/10 bg-[#f5f2eb]">
              <a
                href={selected.pdf}
                download
                className="px-6 py-2.5 rounded-full bg-[#1a3d2b] text-white font-sans text-sm font-semibold hover:bg-[#245038] transition flex items-center gap-2"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}