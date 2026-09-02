'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { TiShoppingCart } from "react-icons/ti";

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  return (
    <>
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Hidden from pointer and assistive tech when closed: the panel stays
          mounted so it can animate, and w-full covers a phone viewport
          entirely, so an off-screen drawer would otherwise swallow taps. */}
      <aside
        aria-hidden={!isCartOpen}
        className={`fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-[transform,visibility] duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0 visible' : 'translate-x-full invisible pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eee]">
          <h2 className="text-lg font-semibold text-[#1f3a2f]">Your Cart</h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="grid h-9 w-9 place-items-center rounded-full text-[#1f3a2f] hover:bg-[#f0ebe4] transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 mt-[2rem]">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center gap-3">
              <div className="text-5xl"><TiShoppingCart /></div>
              <p className="text-[#555]">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-5">
              {cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.product.option ?? 'default'}`}
                  className="flex gap-4 border-b border-[#f0ebe4] pb-5"
                >
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-[#f4f4ec]">
                    <Image src={item.product.icon} alt={item.product.name} fill sizes="96px" className="object-contain" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-[#1f3a2f]">{item.product.name}</h3>
                    {(item.product.size || item.product.count) && (
                      <p className="mt-1 text-sm text-[#777]">
                        {item.product.size ?? ''}
                        {item.product.size && item.product.count ? ' · ' : ''}
                        {item.product.count ? `${item.product.count} bags per pack` : ''}
                      </p>
                    )}

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center gap-2 rounded-full border border-[#d7d7d7] px-2 py-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1, item.product.option)
                          }
                          className="h-7 cursor-pointer w-7 text-base font-semibold text-[#1f3a2f]"
                        >
                          −
                        </button>
                        <span className="min-w-[24px] text-center text-base font-medium text-[#1f3a2f]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1, item.product.option)
                          }
                          className="h-7 w-7 cursor-pointer text-base font-semibold text-[#1f3a2f]"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id, item.product.option)}
                        className="text-sm cursor-pointer text-[#b3261e] hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-base font-semibold text-[#1f3a2f]">
                    ₹{item.product.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-[#eee] px-5 py-4 space-y-3">
            <div className="flex items-center justify-between text-base font-semibold text-[#1f3a2f]">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full rounded-full bg-[#1f3a2f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2d5240]"
            >
              Checkout
            </button>
            <Link
              href="/cart"
              onClick={closeCart}
              className="block w-full rounded-full border border-[#1f3a2f] px-6 py-3 text-center text-sm font-semibold text-[#1f3a2f] transition hover:bg-[#f4f4ec]"
            >
              View Cart
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
