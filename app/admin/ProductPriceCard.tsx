'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPerBag } from '@/lib/products';

interface Props {
  productId: number;
  title: string;
  bagCount: number;
  price: number;
}

// Edits a product's price. The per-bag price is derived from it everywhere on
// the site, so it is only previewed here, never entered.
export default function ProductPriceCard({ productId, title, bagCount, price }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(String(price));
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');

  const parsed = Number(value);
  const isValid = Number.isInteger(parsed) && parsed >= 1 && parsed <= 100000;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    setError('');

    const res = await fetch('/api/admin/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, price: parsed }),
    });
    const data = await res.json().catch(() => null);

    if (res.ok) {
      setStatus('saved');
      router.refresh();
    } else {
      setError(data?.error ?? 'Could not save the price.');
      setStatus('error');
    }
  };

  return (
    <section>
      <h2 className="mb-1 text-xl font-semibold text-[#134632]">Pricing</h2>
      <p className="mb-4 text-sm text-[#555]">
        Changes show on the website straight away and apply to every new order.
      </p>
      <form onSubmit={handleSave} className="rounded-[20px] border border-[#dbe7d2] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-[#134632]">{title}</h3>
        <p className="mb-4 text-xs text-[#888]">Current price: ₹{price} · {formatPerBag(price, bagCount)}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block sm:w-48">
            <span className="mb-1.5 block text-xs text-[#555]">Price per pack (₹)</span>
            <input
              required
              type="number"
              min={1}
              max={100000}
              step={1}
              value={value}
              onChange={(e) => { setValue(e.target.value); setStatus('idle'); }}
              className="w-full rounded-xl border border-[#d1ddcf] bg-[#f8fcf6] px-4 py-2.5 text-sm text-[#1f3a2d] outline-none focus:border-[#23473f]"
            />
          </label>
          <div className="text-sm text-[#555] sm:pb-2.5">
            Per bag: <strong className="text-[#134632]">{isValid ? formatPerBag(parsed, bagCount) : '—'}</strong>
            <span className="text-[#888]"> ({bagCount} bags)</span>
          </div>
          <button
            type="submit"
            disabled={!isValid || parsed === price || status === 'saving'}
            className="rounded-full bg-[#134632] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a5a42] disabled:opacity-50 sm:ml-auto"
          >
            {status === 'saving' ? 'Saving…' : 'Save price'}
          </button>
        </div>
        {status === 'saved' && <p className="mt-3 text-sm text-[#134632]">Saved. The website now shows ₹{price}.</p>}
        {status === 'error' && <p className="mt-3 text-sm text-[#c82b2d]">{error}</p>}
      </form>
    </section>
  );
}
