'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountPercent = cart[0]?.product.discountPercent;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--cream)' }}>
        <div className="text-center">
          <div className="text-[60px] md:text-[80px] mb-6">🛒</div>
          <h2 className="font-['Playfair_Display'] text-[28px] md:text-[36px] font-bold mb-4" style={{ color: 'var(--forest)' }}>
            Your cart is empty
          </h2>
          <p className="text-base md:text-lg mb-8" style={{ color: 'var(--forest-light)' }}>
            Add some Bear Bags to get started!
          </p>
          <Link
            href="/medium-size-bag"
            className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 rounded-full no-underline font-medium text-sm md:text-[15px] transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: 'var(--forest)', color: 'white' }}
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 md:py-16 px-4 md:px-[5%]" style={{ background: 'var(--cream)' }}>
      <div className="max-w-[900px] mx-auto">
        <h1 className="font-['Playfair_Display'] text-[32px] md:text-[44px] font-bold mb-2 text-center" style={{ color: 'var(--forest)' }}>
          Your Cart
        </h1>
        <p className="text-center text-sm md:text-base mb-8" style={{ color: 'var(--forest-light)' }}>
          {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
        </p>

        <div className="rounded-2xl p-4 md:p-5 mb-6 text-center" style={{ background: 'white', border: '1px solid rgba(26,58,42,0.08)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--forest)' }}>
            🚚 Free shipping on all orders
          </p>
        </div>

        {!!discountPercent && (
          <p className="mb-4 text-sm font-medium text-center" style={{ color: 'var(--forest-light)' }}>
            🎉 {discountPercent}% off applied ({discountPercent === 7 ? 'first order' : 'welcome back'})
          </p>
        )}

        <div className="space-y-4 mb-8">
          {cart.map((item) => (
            <div
              key={`${item.product.id}-${item.product.option ?? 'default'}`}
              className="flex gap-4 rounded-2xl p-4 md:p-5"
              style={{ background: 'white', border: '1px solid rgba(26,58,42,0.08)' }}
            >
              <div className="relative h-20 w-20 md:h-24 md:w-24 flex-shrink-0 overflow-hidden rounded-xl text-3xl" style={{ background: 'var(--cream-dark)' }}>
                {item.product.icon.startsWith('/') ? (
                  <Image src={item.product.icon} alt={item.product.name} fill sizes="96px" className="object-contain" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">{item.product.icon}</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-base md:text-lg" style={{ color: 'var(--forest)' }}>
                  {item.product.name}
                </h3>
                {item.product.option && (
                  <p className="text-xs md:text-sm mt-0.5" style={{ color: 'var(--forest-light)' }}>
                    {item.product.option === 'subscribe' ? 'Subscribe & Save' : 'One-Time Purchase'}
                  </p>
                )}
                {(item.product.size || item.product.count) && (
                  <p className="text-xs md:text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {item.product.size ?? ''}
                    {item.product.size && item.product.count ? ' · ' : ''}
                    {item.product.count ? `${item.product.count} bags per pack` : ''}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border px-2 py-1" style={{ borderColor: 'rgba(26,58,42,0.15)' }}>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.product.option)}
                      className="h-7 w-7 cursor-pointer text-base font-semibold"
                      style={{ color: 'var(--forest)' }}
                    >
                      −
                    </button>
                    <span className="min-w-[24px] text-center text-sm font-medium" style={{ color: 'var(--forest)' }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.product.option)}
                      className="h-7 w-7 cursor-pointer text-base font-semibold"
                      style={{ color: 'var(--forest)' }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id, item.product.option)}
                    className="text-xs md:text-sm cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--destructive, #b3261e)' }}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="font-['Playfair_Display'] text-lg md:text-xl font-bold" style={{ color: 'var(--forest)' }}>
                  ₹{item.product.price * item.quantity}
                </div>
                <div className="text-xs opacity-60">₹{item.product.price} each</div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col gap-4 rounded-2xl p-5 md:p-6 sm:flex-row sm:items-center sm:justify-between"
          style={{ background: 'white', border: '1px solid rgba(26,58,42,0.08)' }}
        >
          <div>
            <div className="text-sm" style={{ color: 'var(--forest-light)' }}>Subtotal</div>
            <div className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold" style={{ color: 'var(--forest)' }}>
              ₹{subtotal}
            </div>
          </div>
          <Link
            href="/checkout"
            className="rounded-full px-8 py-3.5 text-center text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: 'var(--forest)', color: 'white' }}
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
