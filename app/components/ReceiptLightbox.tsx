'use client';

import { useEffect } from 'react';
import { formatMonth, type Contribution } from '@/lib/contribution-format';

// Full-screen receipt viewer, used by the /impact contributions table and the
// admin Contributions section. Click the backdrop or press Esc to close.
// Uploads are always images; a PDF can only come from a pasted link, and is
// shown in a frame instead.
export default function ReceiptLightbox({ contribution, onClose }: { contribution: Contribution; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const isPdf = /\.pdf($|\?)/i.test(contribution.receiptUrl);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 sm:py-5 border-b border-[#1a3d2b]/10 shrink-0">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#2d6347] font-semibold mb-0.5">
              Receipt · {formatMonth(contribution.month)}
            </p>
            <h3 className="text-lg sm:text-xl font-bold text-[#1a3d2b]">{contribution.ngo}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full border border-[#1a3d2b]/20 flex items-center justify-center text-[#1a3d2b] hover:bg-[#e8f0e3] transition shrink-0"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="h-[65vh] sm:h-[72vh] bg-[#f8f8f5]">
          {isPdf ? (
            <iframe src={contribution.receiptUrl} title={`${contribution.ngo} receipt`} className="w-full h-full" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- uploaded receipts are served from /api/receipts
            <img
              src={contribution.receiptUrl}
              alt={`${contribution.ngo} receipt`}
              className="w-full h-full object-contain p-4"
            />
          )}
        </div>
      </div>
    </div>
  );
}
