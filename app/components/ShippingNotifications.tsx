'use client';

import { useCart } from '../context/CartContext';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';

export default function ShippingNotifications() {
  const { shippingNotification, dismissShippingNotification } = useCart();

  if (!shippingNotification) return null;

  if (shippingNotification === 'gained') {
    return (
      <div className="fixed top-24 left-1/2 z-[110] -translate-x-1/2 rounded-full bg-[#1f3a2f] px-6 py-3 text-sm font-semibold text-white shadow-xl">
        🎉 You&apos;ve unlocked free shipping!
      </div>
    );
  }

  return (
    <div
      onClick={dismissShippingNotification}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"
      >
        <div className="mb-3 text-4xl">📦</div>
        <h3 className="mb-2 text-lg font-semibold text-[#1f3a2f]">You&apos;ll lose free shipping</h3>
        <p className="mb-5 text-sm text-[#555]">
          Your order total just dropped below ₹{FREE_SHIPPING_THRESHOLD}, so shipping charges will now apply.
          Add a bit more to your cart to keep free shipping.
        </p>
        <button
          type="button"
          onClick={dismissShippingNotification}
          className="w-full cursor-pointer rounded-full bg-[#1f3a2f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2d5240]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
