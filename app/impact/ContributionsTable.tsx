'use client';

import { useState } from 'react';
import { formatMonth, formatRupees, type Contribution } from '@/lib/contribution-format';
import ReceiptLightbox from '@/app/components/ReceiptLightbox';

const PAGE_SIZE = 3;

// Every donation with its receipt, three rows at a time. The total covers all
// contributions, not just the visible page.
export default function ContributionsTable({ contributions }: { contributions: Contribution[] }) {
  const [page, setPage] = useState(0);
  const [viewing, setViewing] = useState<Contribution | null>(null);
  if (contributions.length === 0) return null;

  const totalPages = Math.ceil(contributions.length / PAGE_SIZE);
  const rows = contributions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const total = contributions.reduce((sum, c) => sum + c.amount, 0);
  const pageButton =
    'w-9 h-9 flex items-center justify-center rounded-full border border-[#1a3d2b]/20 text-[#1a3d2b] hover:bg-[#1a3d2b] hover:text-white transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none';

  return (
    <div>
      <div className="overflow-x-auto bg-white rounded-3xl border border-[#1a3d2b]/8 shadow-sm">
        <table className="min-w-full text-left text-[15px] sm:text-[17px]">
          <thead>
            <tr className="border-b border-[#1a3d2b]/10 text-[#1a3d2b]">
              <th className="px-5 sm:px-8 py-4 sm:py-6 font-semibold">Date</th>
              <th className="px-5 sm:px-8 py-4 sm:py-6 font-semibold">NGO</th>
              <th className="px-5 sm:px-8 py-4 sm:py-6 font-semibold">Amount</th>
              <th className="px-5 sm:px-8 py-4 sm:py-6 font-semibold">What it funded</th>
              <th className="px-5 sm:px-8 py-4 sm:py-6 font-semibold">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-[#1a3d2b]/8 text-[#1a3d2b]/75">
                <td className="whitespace-nowrap px-5 sm:px-8 py-4 sm:py-6">{formatMonth(c.month)}</td>
                <td className="px-5 sm:px-8 py-4 sm:py-6 text-[#1a3d2b] font-medium min-w-[160px]">{c.ngo}</td>
                <td className="whitespace-nowrap px-5 sm:px-8 py-4 sm:py-6">{formatRupees(c.amount)}</td>
                <td className="whitespace-nowrap px-5 sm:px-8 py-4 sm:py-6">{c.funded}</td>
                <td className="px-5 sm:px-8 py-4 sm:py-6">
                  {c.receiptUrl ? (
                    <button
                      type="button"
                      onClick={() => setViewing(c)}
                      className="font-semibold text-[#2d6347] hover:text-[#1a3d2b] underline underline-offset-4 decoration-[#2d6347]/30"
                    >
                      View
                    </button>
                  ) : (
                    <span className="text-[#1a3d2b]/30">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {/* Page count | total (under Amount) | Previous/Next, all on one row */}
            <tr>
              <td colSpan={2} className="whitespace-nowrap px-5 sm:px-8 py-4 sm:py-5 text-xs sm:text-sm text-[#1a3d2b]/50">
                {totalPages > 1 && `Page ${page + 1} of ${totalPages}`}
              </td>
              <td className="whitespace-nowrap px-5 sm:px-8 py-4 sm:py-5 font-bold text-[#1a3d2b]">
                {formatRupees(total)} total
              </td>
              <td colSpan={2} className="px-5 sm:px-8 py-4 sm:py-5">
                {totalPages > 1 && (
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setPage(page - 1)} disabled={page === 0} aria-label="Previous page" className={pageButton}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <button type="button" onClick={() => setPage(page + 1)} disabled={page === totalPages - 1} aria-label="Next page" className={pageButton}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {viewing && <ReceiptLightbox contribution={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
