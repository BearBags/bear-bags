'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { dataRouting } from '@/config/data-routing';

// Shown on a public page, so only enough of the address to recognise it:
// aschouhan17@gmail.com → as*********17@gmail.com
const maskEmail = (email: string) => {
  const [name, domain] = email.split('@');
  if (name.length <= 4) return `${name[0]}***@${domain}`;
  return `${name.slice(0, 2)}${'*'.repeat(name.length - 4)}${name.slice(-2)}@${domain}`;
};
const RECOVERY_EMAIL = maskEmail(dataRouting.admin.recoveryEmail);

const inputClass =
  'w-full rounded-xl border border-[#d1ddcf] bg-[#f8fcf6] px-4 py-3 text-sm text-[#1f3a2d] outline-none focus:border-[#23473f]';
const primaryButton =
  'w-full rounded-full bg-[#134632] py-3 text-sm font-semibold text-white transition hover:bg-[#1a5a42] disabled:opacity-60';
const linkButton = 'w-full text-center text-sm text-[#555] hover:text-[#134632]';

// A password field with an eye button that toggles between hidden and visible text.
function PasswordInput(props: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        placeholder={props.placeholder}
        required
        minLength={props.minLength}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className={`${inputClass} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#555] hover:text-[#134632]"
      >
        {visible ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
      </button>
    </div>
  );
}

type Mode = 'login' | 'forgot-send' | 'forgot-otp' | 'forgot-password' | 'forgot-done';

export default function AdminLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
      const data = await res.json().catch(() => null);
      setError(res.status === 429 ? data?.error : 'Incorrect password.');
    }
    setLoading(false);
  };

  const sendCode = async () => {
    setLoading(true);
    setError('');
    setNotice('');

    const res = await fetch('/api/admin/forgot-password', { method: 'POST' });
    const data = await res.json().catch(() => null);
    if (res.ok) {
      setOtp('');
      setMode('forgot-otp');
      setNotice(`A 6-digit code has been sent to ${RECOVERY_EMAIL}.`);
    } else {
      setError(data?.error ?? 'Could not send the code. Please try again.');
    }
    setLoading(false);
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    sendCode();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp }),
    });
    const data = await res.json().catch(() => null);

    if (res.ok) {
      setResetToken(data.resetToken);
      setNotice('');
      setMode('forgot-password');
    } else {
      setError(data?.error ?? 'That code is wrong or has expired.');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('The two passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetToken, newPassword }),
    });
    const data = await res.json().catch(() => null);

    if (res.ok) {
      setMode('forgot-done');
    } else {
      setError(data?.error ?? 'Could not reset the password.');
    }
    setLoading(false);
  };

  const backToLogin = () => {
    setMode('login');
    setError('');
    setNotice('');
    setPassword('');
    setOtp('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const errorLine = error && <p className="text-sm text-[#c82b2d]">{error}</p>;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f4f4ec] px-4">
      <div className="w-full max-w-sm rounded-[24px] border border-[#dbe7d2] bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold text-[#134632]">
          {mode === 'login' ? 'Admin Login' : 'Reset password'}
        </h1>
        <p className="mb-6 text-sm text-[#555]">Bear Bags dashboard</p>

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <PasswordInput placeholder="Password" value={password} onChange={setPassword} />
            {errorLine}
            <button type="submit" disabled={loading} className={primaryButton}>
              {loading ? 'Checking…' : 'Log in'}
            </button>
            <button type="button" onClick={() => { setMode('forgot-send'); setError(''); }} className={linkButton}>
              Forgot password?
            </button>
          </form>
        )}

        {mode === 'forgot-send' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <p className="text-sm text-[#555]">
              We&apos;ll email a 6-digit code to <strong className="text-[#134632]">{RECOVERY_EMAIL}</strong>.
            </p>
            {errorLine}
            <button type="submit" disabled={loading} className={primaryButton}>
              {loading ? 'Sending…' : 'Send code'}
            </button>
            <button type="button" onClick={backToLogin} className={linkButton}>
              Back to login
            </button>
          </form>
        )}

        {mode === 'forgot-otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {notice && <p className="rounded-xl bg-[#eef6ea] px-4 py-3 text-sm text-[#134632]">{notice}</p>}
            <p className="text-sm text-[#555]">Enter it below. It expires in 10 minutes.</p>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className={`${inputClass} tracking-[6px]`}
            />
            {errorLine}
            <button type="submit" disabled={loading || otp.length !== 6} className={primaryButton}>
              {loading ? 'Verifying…' : 'Verify code'}
            </button>
            <button type="button" onClick={sendCode} disabled={loading} className={linkButton}>
              Didn&apos;t get it? Send a new code
            </button>
            <button type="button" onClick={backToLogin} className={linkButton}>
              Back to login
            </button>
          </form>
        )}

        {mode === 'forgot-password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-[#134632]">Code verified. Choose a new password (at least 8 characters).</p>
            <PasswordInput placeholder="New password" value={newPassword} onChange={setNewPassword} minLength={8} />
            <PasswordInput placeholder="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} minLength={8} />
            {errorLine}
            <button type="submit" disabled={loading} className={primaryButton}>
              {loading ? 'Saving…' : 'Reset password'}
            </button>
          </form>
        )}

        {mode === 'forgot-done' && (
          <div className="space-y-4">
            <p className="text-sm text-[#134632]">Password updated. You can log in with your new password now.</p>
            <button type="button" onClick={backToLogin} className={primaryButton}>
              Back to login
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
