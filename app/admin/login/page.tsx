'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'login' | 'forgot-email' | 'forgot-otp' | 'forgot-password' | 'forgot-done';

export default function AdminLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [password, setPassword] = useState('');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin');
    } else {
      setError('Incorrect password.');
    }
    setLoading(false);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await fetch('/api/admin/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    // Always advance — the API responds the same way whether or not the email matched.
    setMode('forgot-otp');
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();

    if (res.ok) {
      setResetToken(data.resetToken);
      setMode('forgot-password');
    } else {
      setError(data.error ?? 'Invalid or expired code.');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetToken, newPassword }),
    });
    const data = await res.json();

    if (res.ok) {
      setMode('forgot-done');
    } else {
      setError(data.error ?? 'Could not reset password.');
    }
    setLoading(false);
  };

  const resetToLogin = () => {
    setMode('login');
    setError('');
    setPassword('');
    setEmail('');
    setOtp('');
    setResetToken('');
    setNewPassword('');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f4f4ec]">
      <div className="w-full max-w-sm rounded-[24px] border border-[#dbe7d2] bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold text-[#134632]">Admin Login</h1>
        <p className="mb-6 text-sm text-[#555]">Bear Bags dashboard</p>

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#d1ddcf] bg-[#f8fcf6] px-4 py-3 text-sm text-[#1f3a2d] outline-none focus:border-[#23473f]"
            />
            {error && <p className="text-sm text-[#c82b2d]">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#134632] py-3 text-sm font-semibold text-white transition hover:bg-[#1a5a42] disabled:opacity-60">
              {loading ? 'Checking…' : 'Log in'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('forgot-email'); setError(''); }}
              className="w-full text-center text-sm text-[#555] hover:text-[#134632]"
            >
              Forgot password?
            </button>
          </form>
        )}

        {mode === 'forgot-email' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <p className="text-sm text-[#555]">Enter the admin recovery email — we&apos;ll send a code to reset the password.</p>
            <input
              type="email"
              placeholder="Recovery email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#d1ddcf] bg-[#f8fcf6] px-4 py-3 text-sm text-[#1f3a2d] outline-none focus:border-[#23473f]"
            />
            {error && <p className="text-sm text-[#c82b2d]">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#134632] py-3 text-sm font-semibold text-white transition hover:bg-[#1a5a42] disabled:opacity-60">
              {loading ? 'Sending…' : 'Send code'}
            </button>
            <button type="button" onClick={resetToLogin} className="w-full text-center text-sm text-[#555] hover:text-[#134632]">
              Back to login
            </button>
          </form>
        )}

        {mode === 'forgot-otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-[#555]">If that email is on file, a 6-digit code was sent to it. Enter it below.</p>
            <input
              type="text"
              inputMode="numeric"
              placeholder="6-digit code"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full rounded-xl border border-[#d1ddcf] bg-[#f8fcf6] px-4 py-3 text-sm tracking-[4px] text-[#1f3a2d] outline-none focus:border-[#23473f]"
            />
            {error && <p className="text-sm text-[#c82b2d]">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#134632] py-3 text-sm font-semibold text-white transition hover:bg-[#1a5a42] disabled:opacity-60">
              {loading ? 'Verifying…' : 'Verify code'}
            </button>
            <button type="button" onClick={resetToLogin} className="w-full text-center text-sm text-[#555] hover:text-[#134632]">
              Back to login
            </button>
          </form>
        )}

        {mode === 'forgot-password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-[#555]">Choose a new password (min. 8 characters).</p>
            <input
              type="password"
              placeholder="New password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-[#d1ddcf] bg-[#f8fcf6] px-4 py-3 text-sm text-[#1f3a2d] outline-none focus:border-[#23473f]"
            />
            {error && <p className="text-sm text-[#c82b2d]">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#134632] py-3 text-sm font-semibold text-white transition hover:bg-[#1a5a42] disabled:opacity-60">
              {loading ? 'Saving…' : 'Reset password'}
            </button>
          </form>
        )}

        {mode === 'forgot-done' && (
          <div className="space-y-4">
            <p className="text-sm text-[#134632]">Password reset. You can log in with your new password now.</p>
            <button
              onClick={resetToLogin}
              className="w-full rounded-full bg-[#134632] py-3 text-sm font-semibold text-white transition hover:bg-[#1a5a42]">
              Back to login
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
