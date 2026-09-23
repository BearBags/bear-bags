'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export type CouponStatus = 'Active' | 'Paused' | 'Scheduled' | 'Expired';

export interface AdminCoupon {
  id: string;
  code: string;
  percent: number;
  blurb: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  status: CouponStatus;
}

const STATUS_STYLES: Record<CouponStatus, string> = {
  Active: 'bg-[#e3f1dc] text-[#134632]',
  Paused: 'bg-[#f0f0e8] text-[#555]',
  Scheduled: 'bg-[#e6eef8] text-[#2a4d7a]',
  Expired: 'bg-[#f8e6e6] text-[#8a2a2a]',
};

const EMPTY_FORM = { code: '', percent: '', blurb: '', startsAt: '', endsAt: '' };

const inputClass =
  'w-full rounded-xl border border-[#d1ddcf] bg-[#f8fcf6] px-4 py-2.5 text-sm text-[#1f3a2d] outline-none focus:border-[#23473f]';

const formatDate = (iso: string) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

// Campaign coupons (festival, influencer codes). The list comes from the
// server-rendered dashboard; after every change we refresh the page so it is
// re-read from the database rather than patched locally.
export default function CouponsManager({ coupons }: { coupons: AdminCoupon[] }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const update = (field: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: field === 'code' ? e.target.value.toUpperCase() : e.target.value });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, percent: Number(form.percent) }),
    });
    const data = await res.json().catch(() => null);

    if (res.ok) {
      setForm(EMPTY_FORM);
      router.refresh();
    } else {
      setError(data?.error ?? 'Could not create the coupon.');
    }
    setSaving(false);
  };

  const toggleActive = async (coupon: AdminCoupon) => {
    setBusyId(coupon.id);
    setError('');
    const res = await fetch('/api/admin/coupons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: coupon.id, active: !coupon.active }),
    });
    if (!res.ok) setError(`Could not update ${coupon.code}.`);
    router.refresh();
    setBusyId(null);
  };

  const remove = async (coupon: AdminCoupon) => {
    if (!window.confirm(`Delete ${coupon.code}? Customers will no longer be able to use it.`)) return;
    setBusyId(coupon.id);
    setError('');
    const res = await fetch(`/api/admin/coupons?id=${encodeURIComponent(coupon.id)}`, { method: 'DELETE' });
    if (!res.ok) setError(`Could not delete ${coupon.code}.`);
    router.refresh();
    setBusyId(null);
  };

  return (
    <section>
      <h2 className="mb-1 text-xl font-semibold text-[#134632]">Coupons</h2>
      <p className="mb-4 text-sm text-[#555]">
        Festival and influencer codes. Active coupons appear at checkout under &ldquo;Available for you&rdquo;.
        FIRSTBEAR and BEARBACK are built in and managed automatically.
      </p>

      {/* Create form */}
      <form onSubmit={handleCreate} className="mb-4 rounded-[20px] border border-[#dbe7d2] bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-[#134632]">Add a coupon</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block">
            <span className="mb-1.5 block text-xs text-[#555]">Code</span>
            <input
              required
              value={form.code}
              onChange={update('code')}
              placeholder="DIWALI10"
              pattern="[A-Za-z0-9]{3,20}"
              title="3–20 letters or numbers, no spaces"
              maxLength={20}
              className={`${inputClass} uppercase`}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs text-[#555]">Discount %</span>
            <input
              required
              type="number"
              min={1}
              max={100}
              step={1}
              value={form.percent}
              onChange={update('percent')}
              placeholder="10"
              className={inputClass}
            />
          </label>
          <label className="block lg:col-span-3">
            <span className="mb-1.5 block text-xs text-[#555]">Description shown at checkout</span>
            <input value={form.blurb} onChange={update('blurb')} placeholder="Diwali special — 10% off" className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs text-[#555]">Starts (optional)</span>
            <input type="date" value={form.startsAt} onChange={update('startsAt')} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs text-[#555]">Ends (optional)</span>
            <input type="date" value={form.endsAt} min={form.startsAt || undefined} onChange={update('endsAt')} className={inputClass} />
          </label>
          <div className="flex items-end lg:col-span-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-[#134632] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a5a42] disabled:opacity-60 sm:w-auto"
            >
              {saving ? 'Adding…' : 'Add coupon'}
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-[#888]">Leave the dates empty for a coupon that runs until you pause or delete it.</p>
        {error && <p className="mt-3 text-sm text-[#c82b2d]">{error}</p>}
      </form>

      {/* Existing coupons */}
      <div className="overflow-x-auto rounded-[20px] border border-[#dbe7d2] bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-[#dbe7d2] text-left text-xs font-semibold uppercase tracking-wide text-[#555]">
              <th className="px-5 py-3">Code</th>
              <th className="px-5 py-3">Discount</th>
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3">Runs</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-[#888]">No coupons yet</td>
              </tr>
            )}
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b border-[#f0f0e8] last:border-0 hover:bg-[#f8fcf6]">
                <td className="px-5 py-3 font-semibold tracking-wide text-[#1f3a2d]">{coupon.code}</td>
                <td className="px-5 py-3 font-semibold text-[#134632]">{coupon.percent}%</td>
                <td className="px-5 py-3 text-[#555]">{coupon.blurb || '—'}</td>
                <td className="whitespace-nowrap px-5 py-3 text-[#555]">
                  {!coupon.startsAt && !coupon.endsAt
                    ? 'No end date'
                    : `${formatDate(coupon.startsAt) || 'Now'} → ${formatDate(coupon.endsAt) || 'No end date'}`}
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[coupon.status]}`}>
                    {coupon.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleActive(coupon)}
                    disabled={busyId === coupon.id}
                    className="mr-2 rounded-full border border-[#d1ddcf] px-4 py-1.5 text-xs font-medium text-[#134632] hover:bg-[#f0f0e8] disabled:opacity-50"
                  >
                    {coupon.active ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(coupon)}
                    disabled={busyId === coupon.id}
                    className="rounded-full border border-[#f0d4d4] px-4 py-1.5 text-xs font-medium text-[#c82b2d] hover:bg-[#fbf0f0] disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
