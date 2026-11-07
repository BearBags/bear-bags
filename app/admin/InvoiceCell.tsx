'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { safeFetch } from '@/lib/safe-fetch';
import { useFeedback } from './AdminFeedback';

interface Props {
  orderId: string;
  /** Absent for orders placed before invoicing existed. */
  status?: 'pending' | 'running' | 'done' | 'failed';
  number?: string | null;
  error?: string | null;
  /** Link to the invoice in Zoho Books, when it exists. */
  zohoUrl?: string | null;
  /** Invoices are only created for shipped (or delivered) orders. */
  orderStatus: 'placed' | 'shipped' | 'delivered' | 'cancelled';
}

// The Invoice column of the admin Orders table: the Zoho invoice number once it
// exists, otherwise the status with a button to (re)try.
export default function InvoiceCell({ orderId, status, number, error, zohoUrl, orderStatus }: Props) {
  const router = useRouter();
  const { notify } = useFeedback();
  const [busy, setBusy] = useState(false);

  const retry = async () => {
    setBusy(true);
    const res = await safeFetch(`/api/admin/orders/${orderId}/invoice`, { method: 'POST' });
    const data = await res.json().catch(() => null);
    if (res.ok) notify(`Invoice ${data?.number ?? ''} created and emailed to the customer.`);
    else notify(data?.error ?? 'The invoice could not be created.', 'error');
    setBusy(false);
    router.refresh();
  };

  if (status === 'done') {
    return zohoUrl ? (
      <a href={zohoUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-[#134632] underline underline-offset-2">
        {number}
      </a>
    ) : (
      <span className="font-medium text-[#134632]">{number}</span>
    );
  }

  if (orderStatus === 'placed') return <span className="text-xs text-[#888]">When shipped</span>;
  if (orderStatus === 'cancelled') return <span className="text-xs text-[#888]">—</span>;

  const badge =
    status === 'failed'
      ? { label: 'Failed', className: 'bg-[#f8e6e6] text-[#8a2a2a]' }
      : status
        ? { label: 'Creating…', className: 'bg-[#e6eef8] text-[#2a4d7a]' }
        : { label: 'None', className: 'bg-[#f0f0e8] text-[#555]' };

  return (
    <div className="flex items-center gap-2">
      {/* The reason is on hover, and in the toast after a retry */}
      <span title={error ?? undefined} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
        {badge.label}
      </span>
      <button
        type="button"
        onClick={retry}
        disabled={busy}
        className="rounded-full border border-[#d1ddcf] px-3 py-1 text-xs font-medium text-[#134632] hover:bg-[#f0f0e8] disabled:opacity-50"
      >
        {busy ? 'Working…' : status ? 'Retry' : 'Create'}
      </button>
    </div>
  );
}
