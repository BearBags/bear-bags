'use client';

import { useEffect, useRef, useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';

interface CopyableCodeProps {
  code: string;
  /** Extra classes for the code text itself. */
  className?: string;
}

// A coupon code the customer can click to copy. A small "Copied!" bubble rises
// above the code and fades out on its own, so the confirmation never pushes the
// surrounding text around.
export default function CopyableCode({ code, className = '' }: CopyableCodeProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the pending reset if the component unmounts mid-countdown.
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const flash = (ok: boolean) => {
    setCopied(ok);
    setFailed(!ok);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { setCopied(false); setFailed(false); }, 1800);
  };

  const handleCopy = async () => {
    try {
      // navigator.clipboard needs a secure context; fall back for plain http.
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const el = document.createElement('textarea');
        el.value = code;
        el.setAttribute('readonly', '');
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      flash(true);
    } catch {
      flash(false);
    }
  };

  return (
    <span className="relative inline-block">
      {/* Bubble is absolutely positioned so it cannot reflow the sentence. */}
      <span
        aria-hidden={!copied && !failed}
        className={`pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-semibold text-white transition-all duration-200 ${
          copied || failed ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
        }`}
        style={{ background: failed ? '#c82b2d' : '#23473f' }}>
        {failed ? 'Press Ctrl+C' : <><FiCheck className="h-3 w-3" />Copied!</>}
      </span>

      <button
        type="button"
        onClick={handleCopy}
        title={`Copy ${code}`}
        aria-label={`Copy coupon code ${code}`}
        className={`group inline-flex cursor-pointer items-center gap-1 rounded font-bold underline decoration-dotted underline-offset-2 transition-colors hover:text-[#2d6a4f] ${className}`}>
        {code}
        <FiCopy aria-hidden="true" className="h-3 w-3 opacity-50 transition-opacity group-hover:opacity-100" />
      </button>
    </span>
  );
}
