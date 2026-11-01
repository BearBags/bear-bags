'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'error';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
}

interface Feedback {
  notify: (message: string, type?: ToastType) => void;
  /** Resolves true if the admin confirmed, false if they backed out. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<Feedback | null>(null);

// Errors stay up longer: they usually need reading, not just noticing.
const TOAST_MS: Record<ToastType, number> = { success: 4000, error: 7000 };

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback must be used within AdminFeedbackProvider');
  return context;
};

function ConfirmDialog({ options, onClose }: { options: ConfirmOptions; onClose: (confirmed: boolean) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={() => onClose(false)}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md animate-[pop-in_0.15s_ease-out] rounded-[20px] bg-white p-6 shadow-2xl"
      >
        <h3 id="confirm-title" className="text-lg font-semibold text-[#134632]">{options.title}</h3>
        <p id="confirm-message" className="mt-2 text-sm leading-relaxed text-[#555]">{options.message}</p>
        <div className="mt-6 flex justify-end gap-2">
          {/* Focus starts on Cancel so a stray Enter can't delete anything. */}
          <button
            type="button"
            autoFocus
            onClick={() => onClose(false)}
            className="rounded-full border border-[#d1ddcf] px-5 py-2.5 text-sm font-medium text-[#555] hover:bg-[#f0f0e8]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onClose(true)}
            className="rounded-full bg-[#c82b2d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a82224]"
          >
            {options.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete confirmations and success/failure toasts for the admin dashboard.
export default function AdminFeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (confirmed: boolean) => void }) | null>(null);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((t) => t.id !== id)), []);

  const notify = useCallback<Feedback['notify']>((message, type = 'success') => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => dismiss(id), TOAST_MS[type]);
  }, [dismiss]);

  const confirm = useCallback<Feedback['confirm']>(
    (options) => new Promise((resolve) => setPending({ ...options, resolve })),
    [],
  );

  const closeConfirm = useCallback((confirmed: boolean) => {
    setPending((current) => {
      current?.resolve(confirmed);
      return null;
    });
  }, []);

  const value = useMemo(() => ({ notify, confirm }), [notify, confirm]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      {pending && <ConfirmDialog options={pending} onClose={closeConfirm} />}

      {/* Below the sticky site header, above any open modal */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-20 z-[70] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex animate-[toast-in_0.2s_ease-out] items-start gap-3 rounded-2xl border bg-white p-4 shadow-lg ${
              toast.type === 'error' ? 'border-[#f0d4d4]' : 'border-[#dbe7d2]'
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                toast.type === 'error' ? 'bg-[#f8e6e6] text-[#c82b2d]' : 'bg-[#e3f1dc] text-[#134632]'
              }`}
            >
              {toast.type === 'error' ? '!' : '✓'}
            </span>
            <p className="flex-1 text-sm leading-snug text-[#1f3a2d]">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              className="shrink-0 text-[#888] hover:text-[#134632]"
            >
              <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
                <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}
