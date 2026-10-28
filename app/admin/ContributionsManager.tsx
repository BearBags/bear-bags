'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatMonth, formatRupees, type Contribution } from '@/lib/contribution-format';

const EMPTY_FORM = { month: '', ngo: '', amount: '', funded: '', receiptUrl: '' };

const inputClass =
  'w-full rounded-xl border border-[#d1ddcf] bg-[#f8fcf6] px-4 py-2.5 text-sm text-[#1f3a2d] outline-none focus:border-[#23473f]';

// Add form (inline) and edit form (in the modal). With `contribution` it edits
// that entry, otherwise it adds a new one and clears itself after saving.
function ContributionForm({
  contribution,
  onSaved,
  onCancel,
}: {
  contribution?: Contribution;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const editing = Boolean(contribution);
  const [form, setForm] = useState(
    contribution
      ? { month: contribution.month, ngo: contribution.ngo, amount: String(contribution.amount), funded: contribution.funded, receiptUrl: contribution.receiptUrl }
      : EMPTY_FORM,
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const update = (field: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  // Uploads straight away and keeps the returned link in the form; the
  // contribution itself is saved with the rest of the form.
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');

    const body = new FormData();
    body.append('file', file);
    const res = await fetch('/api/admin/receipts', { method: 'POST', body });
    const data = await res.json().catch(() => null);

    if (res.ok) {
      setForm((prev) => ({ ...prev, receiptUrl: data.url }));
    } else {
      setError(data?.error ?? 'Could not upload the receipt.');
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch('/api/admin/contributions', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: Number(form.amount), ...(contribution && { id: contribution.id }) }),
    });
    const data = await res.json().catch(() => null);

    setSaving(false);
    if (res.ok) {
      if (!editing) setForm(EMPTY_FORM);
      onSaved();
    } else {
      setError(data?.error ?? 'Could not save the contribution.');
    }
  };

  const uploadButton = (
    <label
      className={`block cursor-pointer rounded-xl border border-[#134632] px-4 py-2.5 text-center text-sm font-medium text-[#134632] hover:bg-[#f0f0e8] ${uploading ? 'pointer-events-none opacity-60' : ''}`}
    >
      {uploading ? 'Uploading…' : form.receiptUrl ? 'Re-upload image' : 'Upload image'}
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="sr-only" />
    </label>
  );

  const removeButton = form.receiptUrl && (
    <button type="button" onClick={() => setForm({ ...form, receiptUrl: '' })} className="text-xs text-[#a33] underline underline-offset-2">
      Remove image
    </button>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className={`grid gap-4 ${editing ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
        {/* In the modal the receipt preview spans the full width on top */}
        {editing && (
          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-xs text-[#555]">Receipt image</span>
            <div className="flex h-56 items-center justify-center overflow-hidden rounded-xl border border-[#d1ddcf] bg-[#f8f8f5]">
              {form.receiptUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- uploaded receipts are served from /api/receipts
                <img src={form.receiptUrl} alt="Receipt preview" className="h-full w-full object-contain p-2" />
              ) : (
                <span className="text-sm text-[#888]">No receipt uploaded</span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-4">
              <div className="w-48">{uploadButton}</div>
              {removeButton}
            </div>
          </div>
        )}
        <label className="block">
          <span className="mb-1.5 block text-xs text-[#555]">Month</span>
          <input required type="month" value={form.month} onChange={update('month')} className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs text-[#555]">NGO</span>
          <input required maxLength={100} value={form.ngo} onChange={update('ngo')} placeholder="Gnana Jyothi Trust" className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs text-[#555]">Amount (₹)</span>
          <input
            required
            type="number"
            min={1}
            step={1}
            value={form.amount}
            onChange={update('amount')}
            placeholder="20000"
            className={inputClass}
          />
        </label>
        {!editing && (
          <div>
            <span className="mb-1.5 block text-xs text-[#555]">Receipt image</span>
            {uploadButton}
            {form.receiptUrl && (
              <div className="mt-1.5 flex gap-3 text-xs">
                <a href={form.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-[#134632] underline underline-offset-2">
                  Attached ✓ Preview
                </a>
                {removeButton}
              </div>
            )}
          </div>
        )}
        <label className={`block ${editing ? '' : 'sm:col-span-2 lg:col-span-3'}`}>
          <span className="mb-1.5 flex justify-between text-xs text-[#555]">
            What it funded
            <span>{form.funded.length}/60</span>
          </span>
          <input required maxLength={60} value={form.funded} onChange={update('funded')} placeholder="Welfare of blind students at the hostel" className={inputClass} />
        </label>
        <div className={`flex items-end gap-2 ${editing ? 'sm:col-span-2 justify-end' : ''}`}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-[#d1ddcf] px-5 py-2.5 text-sm font-medium text-[#555] hover:bg-[#f0f0e8]"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full rounded-full bg-[#134632] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a5a42] disabled:opacity-60 sm:w-auto"
          >
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add contribution'}
          </button>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-[#c82b2d]">{error}</p>}
    </form>
  );
}

// Edit form in a card over a dark backdrop; clicking the backdrop or Esc closes it.
function EditModal({ contribution, onClose, onSaved }: { contribution: Contribution; onClose: () => void; onSaved: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[20px] bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#134632]">Edit contribution</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d1ddcf] text-[#134632] hover:bg-[#f0f0e8]"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <ContributionForm contribution={contribution} onSaved={onSaved} onCancel={onClose} />
      </div>
    </div>
  );
}

// Donations listed on /impact. Like the coupons, the list comes from the
// server-rendered dashboard and is re-read with router.refresh() after each change.
export default function ContributionsManager({ contributions }: { contributions: Contribution[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Contribution | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const total = contributions.reduce((sum, c) => sum + c.amount, 0);

  const remove = async (c: Contribution) => {
    if (!window.confirm(`Delete the ${formatRupees(c.amount)} contribution to ${c.ngo}? It will disappear from the impact page.`)) return;
    setBusyId(c.id);
    setError('');
    const res = await fetch(`/api/admin/contributions?id=${encodeURIComponent(c.id)}`, { method: 'DELETE' });
    if (!res.ok) setError(`Could not delete the contribution to ${c.ngo}.`);
    router.refresh();
    setBusyId(null);
  };

  return (
    <section>
      <h2 className="mb-1 text-xl font-semibold text-[#134632]">Contributions</h2>
      <p className="mb-4 text-sm text-[#555]">
        Donations shown in the table on the impact page. The total also updates the &ldquo;contributed so far&rdquo; figure on the home page.
      </p>

      {/* Add form */}
      <div className="mb-4 rounded-[20px] border border-[#dbe7d2] bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-[#134632]">Add a contribution</h3>
        <ContributionForm onSaved={() => router.refresh()} />
      </div>

      {error && <p className="mb-3 text-sm text-[#c82b2d]">{error}</p>}

      {/* Existing contributions */}
      <div className="overflow-x-auto rounded-[20px] border border-[#dbe7d2] bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-[#dbe7d2] text-left text-xs font-semibold uppercase tracking-wide text-[#555]">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">NGO</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">What it funded</th>
              <th className="px-5 py-3">Receipt</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contributions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-[#888]">No contributions yet</td>
              </tr>
            )}
            {contributions.map((c) => (
              <tr key={c.id} className="border-b border-[#f0f0e8] last:border-0 hover:bg-[#f8fcf6]">
                <td className="whitespace-nowrap px-5 py-3 text-[#555]">{formatMonth(c.month)}</td>
                <td className="px-5 py-3 font-medium text-[#1f3a2d]">{c.ngo}</td>
                <td className="whitespace-nowrap px-5 py-3 font-semibold text-[#134632]">{formatRupees(c.amount)}</td>
                <td className="px-5 py-3 text-[#555]">{c.funded}</td>
                <td className="px-5 py-3">
                  {c.receiptUrl ? (
                    <a href={c.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-[#134632] underline underline-offset-2">
                      View
                    </a>
                  ) : (
                    <span className="text-[#bbb]">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setEditing(c)}
                    disabled={busyId === c.id}
                    className="mr-2 rounded-full border border-[#d1ddcf] px-4 py-1.5 text-xs font-medium text-[#134632] hover:bg-[#f0f0e8] disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c)}
                    disabled={busyId === c.id}
                    className="rounded-full border border-[#f0d4d4] px-4 py-1.5 text-xs font-medium text-[#c82b2d] hover:bg-[#fbf0f0] disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {contributions.length > 0 && (
            <tfoot>
              <tr className="border-t border-[#dbe7d2]">
                <td colSpan={2} />
                <td colSpan={4} className="px-5 py-3 font-semibold text-[#134632]">{formatRupees(total)} total</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {editing && (
        <EditModal
          key={editing.id}
          contribution={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </section>
  );
}
