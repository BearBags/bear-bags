'use client';

import { useEffect, useState } from 'react';

export default function RecoveryEmailCard() {
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        setSaved(data.email);
        setEmail(data.email ?? '');
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    setError('');

    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (res.ok) {
      setSaved(data.email);
      setStatus('saved');
    } else {
      setError(data.error ?? 'Could not save email.');
      setStatus('error');
    }
  };

  return (
    <div className="rounded-[20px] border border-[#dbe7d2] bg-white p-5 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-[#134632]">Recovery Email</h3>
      <p className="mb-4 text-xs text-[#888]">Password reset codes are sent here.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
          placeholder="admin@bearbags.in"
          className="flex-1 rounded-xl border border-[#d1ddcf] bg-[#f8fcf6] px-4 py-2.5 text-sm text-[#1f3a2d] outline-none focus:border-[#23473f]"
        />
        <button
          type="submit"
          disabled={status === 'saving' || email === saved}
          className="rounded-full bg-[#134632] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a5a42] disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving…' : 'Save'}
        </button>
      </form>
      {status === 'saved' && <p className="mt-2 text-xs text-[#134632]">Saved.</p>}
      {status === 'error' && <p className="mt-2 text-xs text-[#c82b2d]">{error}</p>}
    </div>
  );
}
