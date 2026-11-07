'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { safeFetch } from '@/lib/safe-fetch';
import { useFeedback } from './AdminFeedback';

export type OrderStatus = 'placed' | 'shipped' | 'delivered' | 'cancelled';

interface Props {
  orderId: string;
  /** e.g. BB-7D7DD7C2, shown in the confirmation dialog. */
  orderNumber: string;
  status: OrderStatus;
  /** Whether marking shipped also creates and emails the Zoho invoice. */
  invoicesOn: boolean;
}

const BADGES: Record<OrderStatus, { label: string; className: string }> = {
  placed: { label: 'Placed', className: 'bg-[#f0f0e8] text-[#555]' },
  shipped: { label: 'Shipped', className: 'bg-[#e6eef8] text-[#2a4d7a]' },
  delivered: { label: 'Delivered', className: 'bg-[#e3f1e6] text-[#134632]' },
  cancelled: { label: 'Cancelled', className: 'bg-[#f8e6e6] text-[#8a2a2a]' },
};

// The Status column of the admin Orders table, with the next allowed actions.
export default function StatusCell({ orderId, orderNumber, status, invoicesOn }: Props) {
  const router = useRouter();
  const { notify, confirm } = useFeedback();
  const [busy, setBusy] = useState(false);

  const DIALOGS = {
    shipped: {
      title: `Mark ${orderNumber} as shipped?`,
      message: invoicesOn
        ? 'The GST invoice will be created in Zoho Books, dated today, and emailed to the customer with the PDF attached.'
        : 'The order will be marked as shipped.',
      confirmLabel: 'Mark shipped',
      tone: 'primary' as const,
    },
    delivered: {
      title: `Mark ${orderNumber} as delivered?`,
      message: 'The order will be marked as delivered. No email is sent.',
      confirmLabel: 'Mark delivered',
      tone: 'primary' as const,
    },
    cancelled: {
      title: `Cancel ${orderNumber}?`,
      message: 'No invoice will be created. Refund the payment from the Razorpay dashboard yourself. This cannot be undone.',
      confirmLabel: 'Cancel order',
      tone: 'danger' as const,
    },
  };

  const change = async (target: Exclude<OrderStatus, 'placed'>) => {
    if (!(await confirm(DIALOGS[target]))) return;
    setBusy(true);
    const res = await safeFetch(`/api/admin/orders/${orderId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: target }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) notify(data?.error ?? 'The status could not be changed.', 'error');
    else if (data?.invoice?.status === 'done') notify(`${orderNumber} shipped. Invoice ${data.invoice.number} emailed to the customer.`);
    else if (data?.invoice) notify(`${orderNumber} shipped, but the invoice failed: ${data.invoice.error ?? 'unknown error'}. Use Retry in the Invoice column.`, 'error');
    else notify(`${orderNumber} marked ${target}.`);
    setBusy(false);
    router.refresh();
  };

  const badge = BADGES[status];
  const button = 'rounded-full border border-[#d1ddcf] px-3 py-1 text-xs font-medium text-[#134632] hover:bg-[#f0f0e8] disabled:opacity-50';

  return (
    <div className="flex items-center gap-2">
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
      {status === 'placed' && (
        <>
          <button type="button" disabled={busy} className={button} onClick={() => change('shipped')}>
            {busy ? 'Working…' : 'Mark shipped'}
          </button>
          <button
            type="button"
            disabled={busy}
            className="rounded-full px-2 py-1 text-xs text-[#8a2a2a] hover:underline disabled:opacity-50"
            onClick={() => change('cancelled')}
          >
            Cancel
          </button>
        </>
      )}
      {status === 'shipped' && (
        <button type="button" disabled={busy} className={button} onClick={() => change('delivered')}>
          {busy ? 'Working…' : 'Mark delivered'}
        </button>
      )}
    </div>
  );
}
