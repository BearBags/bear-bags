'use client';
import { useState } from 'react';
import Image from 'next/image';

interface RazorpayHandlerResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  icon: string;
  size?: string;
  count?: number;
  option?: string;
  features?: string[];
  discountPercent?: number;
}

interface CheckoutProps {
  cartItems: { product: Product; quantity: number }[];
  isBuyNow?: boolean;
  onUpdateQuantity: (productId: number, quantity: number, option?: string) => void;
  onRemoveItem: (productId: number, option?: string) => void;
  onClearCart: () => void;
}

export default function Checkout({ cartItems, isBuyNow = false, onUpdateQuantity, onRemoveItem, onClearCart }: CheckoutProps) {
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [confirmedTotal, setConfirmedTotal] = useState<number | null>(null);
  const [confirmedDiscountPercent, setConfirmedDiscountPercent] = useState<number | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'online'
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = 0; // free shipping on all orders
  const total = subtotal + shipping;
  const impact = Math.round(total * 0.3);
  const discountPercent = cartItems[0]?.product.discountPercent;

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      pincode: '',
      paymentMethod: 'online'
    });
  };

  // The server re-checks order history by email and applies the authoritative
  // first-time/returning discount, which may differ from the client's
  // localStorage-based guess, so the confirmation reflects what was actually charged.
  const finalizeOrder = (data: { total?: number; discountPercent?: number }) => {
    if (typeof data?.total === 'number') setConfirmedTotal(data.total);
    if (typeof data?.discountPercent === 'number') setConfirmedDiscountPercent(data.discountPercent);
    setOrderPlaced(true);
    setTimeout(() => {
      onClearCart();
      setOrderPlaced(false);
      setConfirmedTotal(null);
      setConfirmedDiscountPercent(null);
      resetForm();
    }, 4000);
  };

  const handleOnlinePayment = async () => {
    setIsProcessingPayment(true);
    try {
      const createRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, cartItems }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        setPaymentError(createData?.error ?? 'Could not start payment. Please try again.');
        setIsProcessingPayment(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPaymentError('Could not load the payment window. Check your connection and try again.');
        setIsProcessingPayment(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        order_id: createData.razorpayOrderId,
        name: 'Bear Bags',
        description: 'Order payment',
        prefill: { name: formData.name, email: formData.email, contact: formData.phone },
        theme: { color: '#1a3a2a' },
        handler: async (response) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ formData, cartItems, ...response }),
            });
            const verifyData = await verifyRes.json();
            setIsProcessingPayment(false);
            if (!verifyRes.ok) {
              setPaymentError(verifyData?.error ?? 'Payment verification failed. Please contact support.');
              return;
            }
            finalizeOrder(verifyData);
          } catch {
            setIsProcessingPayment(false);
            setPaymentError('Payment succeeded but confirming the order failed. Please contact support with your payment ID.');
          }
        },
        modal: {
          ondismiss: () => setIsProcessingPayment(false),
        },
      });
      razorpay.open();
    } catch {
      setPaymentError('Something went wrong starting the payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    handleOnlinePayment();
  };

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--cream)' }}>
        <div className="text-center">
          <div className="text-[60px] md:text-[80px] mb-6">🛒</div>
          <h2 className="font-['Playfair_Display'] text-[28px] md:text-[36px] font-bold mb-4"
              style={{ color: 'var(--forest)' }}>
            Your cart is empty
          </h2>
          <p className="text-base md:text-lg mb-8" style={{ color: 'var(--text-muted)' }}>
            Add some Bear Bags to get started!
          </p>
          <a href="/products"
             className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 rounded-full no-underline font-medium text-sm md:text-[15px] transition-all hover:-translate-y-0.5 hover:shadow-lg"
             style={{ background: 'var(--forest)', color: 'white' }}>
            Browse Products
          </a>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--cream)' }}>
        <div className="text-center max-w-[500px] px-4 md:px-6">
          <div className="text-[60px] md:text-[80px] mb-6">✓</div>
          <h2 className="font-['Playfair_Display'] text-[28px] md:text-[36px] font-bold mb-4"
              style={{ color: 'var(--forest)' }}>
            Order Placed Successfully!
          </h2>
          <p className="text-base md:text-lg mb-4" style={{ color: 'var(--text-muted)' }}>
            Thank you for choosing Bear Bags. Your order will be delivered soon.
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--forest-light)' }}>
            You are helping us make a difference. 30% of your purchase goes to community development.
          </p>
          {confirmedTotal !== null && (
            <p className="text-base font-medium" style={{ color: 'var(--forest)' }}>
              Total charged: ₹{confirmedTotal}
              {confirmedDiscountPercent ? ` (${confirmedDiscountPercent}% discount applied)` : ''}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-16 px-4 md:px-[5%]" style={{ background: 'var(--cream)' }}>
      <div className="max-w-[1200px] mx-auto">
        <h1 className="font-['Playfair_Display'] text-[32px] md:text-[48px] font-bold mb-8 md:mb-12 text-center"
            style={{ color: 'var(--forest)' }}>
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="rounded-[24px] p-4 md:p-8 mb-6 md:mb-8"
                 style={{ background: 'white', border: '1px solid rgba(26,58,42,0.08)' }}>
              <h2 className="font-['Playfair_Display'] text-[20px] md:text-[24px] font-bold mb-4 md:mb-6"
                  style={{ color: 'var(--forest)' }}>
                Your Items
              </h2>

              {!!discountPercent && (
                <p className="mb-4 text-sm font-medium" style={{ color: 'var(--forest-light)' }}>
                  🎉 {discountPercent}% off applied ({discountPercent === 7 ? 'first order' : 'welcome back'})
                </p>
              )}

              <div className="space-y-3 md:space-y-4">
                {cartItems.map((item) => (
                  <div key={`${item.product.id}-${item.product.option ?? 'default'}`}
                       className="flex gap-3 md:gap-4 p-3 md:p-4 rounded-xl border"
                       style={{ borderColor: 'rgba(26,58,42,0.08)' }}>
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg flex items-center justify-center text-2xl md:text-3xl flex-shrink-0 overflow-hidden"
                         style={{ background: 'var(--cream-dark)' }}>
                      {item.product.icon.startsWith('/') ? (
                        <Image src={item.product.icon} alt={item.product.name} fill sizes="80px" className="object-contain" />
                      ) : (
                        item.product.icon
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-1 text-sm md:text-base" style={{ color: 'var(--forest)' }}>
                        {item.product.name}
                      </h3>
                      <p className="text-xs md:text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                        {(item.product.size ?? item.product.option ?? 'Bag')} • {item.product.count ?? item.quantity} bags
                      </p>
                      {isBuyNow ? (
                        <p className="text-sm md:text-base font-medium" style={{ color: 'var(--forest)' }}>
                          Qty: {item.quantity}
                        </p>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                          <div className="flex items-center gap-2 rounded-lg overflow-hidden border"
                               style={{ borderColor: 'rgba(26,58,42,0.15)' }}>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1), item.product.option)}
                              className="px-2 md:px-3 py-1 cursor-pointer hover:bg-black/5 transition-colors text-sm md:text-base"
                              style={{ color: 'var(--forest)' }}>
                              −
                            </button>
                            <span className="font-medium min-w-[24px] md:min-w-[30px] text-center text-sm md:text-base"
                                  style={{ color: 'var(--forest)' }}>
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.product.option)}
                              className="px-2 md:px-3 cursor-pointer py-1 hover:bg-black/5 transition-colors text-sm md:text-base"
                              style={{ color: 'var(--forest)' }}>
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.product.id, item.product.option)}
                            className="text-xs md:text-sm opacity-60 hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--destructive)' }}>
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-['Playfair_Display'] text-[18px] md:text-[20px] font-bold"
                           style={{ color: 'var(--forest)' }}>
                        ₹{item.product.price * item.quantity}
                      </div>
                      <div className="text-xs opacity-60">₹{item.product.price} each</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Form */}
            <div className="rounded-[24px] p-4 md:p-8"
                 style={{ background: 'white', border: '1px solid rgba(26,58,42,0.08)' }}>
              <h2 className="font-['Playfair_Display'] text-[20px] md:text-[24px] font-bold mb-4 md:mb-6"
                  style={{ color: 'var(--forest)' }}>
                Shipping Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: 'var(--forest)' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border outline-none transition-colors text-sm md:text-base"
                    style={{ borderColor: 'rgba(26,58,42,0.15)' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--forest)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(26,58,42,0.15)'}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: 'var(--forest)' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border outline-none transition-colors text-sm md:text-base"
                      style={{ borderColor: 'rgba(26,58,42,0.15)' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'var(--forest)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(26,58,42,0.15)'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: 'var(--forest)' }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border outline-none transition-colors text-sm md:text-base"
                      style={{ borderColor: 'rgba(26,58,42,0.15)' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'var(--forest)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(26,58,42,0.15)'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: 'var(--forest)' }}>
                    Address
                  </label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border outline-none transition-colors resize-none text-sm md:text-base"
                    style={{ borderColor: 'rgba(26,58,42,0.15)' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--forest)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(26,58,42,0.15)'}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: 'var(--forest)' }}>
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border outline-none transition-colors text-sm md:text-base"
                      style={{ borderColor: 'rgba(26,58,42,0.15)' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'var(--forest)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(26,58,42,0.15)'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: 'var(--forest)' }}>
                      Pincode
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border outline-none transition-colors text-sm md:text-base"
                      style={{ borderColor: 'rgba(26,58,42,0.15)' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'var(--forest)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(26,58,42,0.15)'}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ borderColor: 'rgba(26,58,42,0.15)' }}>
                  <div className="flex-1">
                    <div className="font-medium" style={{ color: 'var(--forest)' }}>Online Payment</div>
                    <div className="text-xs opacity-60">UPI, Cards, Net Banking — secured by Razorpay</div>
                  </div>
                </div>

                {paymentError && (
                  <p className="text-sm mt-2" style={{ color: 'var(--destructive, #b3261e)' }}>
                    {paymentError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full px-8 py-4 cursor-pointer rounded-full font-medium text-base transition-all hover:-translate-y-0.5 hover:shadow-lg mt-6 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  style={{ background: 'var(--forest)', color: 'white' }}>
                  {isProcessingPayment ? 'Processing payment…' : `Pay ₹${total}`}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-[24px] p-4 md:p-8 lg:sticky lg:top-4"
                 style={{ background: 'white', border: '1px solid rgba(26,58,42,0.08)' }}>
              <h2 className="font-['Playfair_Display'] text-[20px] md:text-[24px] font-bold mb-4 md:mb-6"
                  style={{ color: 'var(--forest)' }}>
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span style={{ color: 'var(--forest)' }}>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                  <span style={{ color: 'var(--forest)' }}>FREE</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--forest-light)' }}>
                  ✓ Free shipping on all orders
                </p>
                <div className="pt-3 border-t flex justify-between"
                     style={{ borderColor: 'rgba(26,58,42,0.1)' }}>
                  <span className="font-medium" style={{ color: 'var(--forest)' }}>Total</span>
                  <span className="font-['Playfair_Display'] text-[24px] font-bold"
                        style={{ color: 'var(--forest)' }}>
                    ₹{total}
                  </span>
                </div>
              </div>

              <div className="rounded-xl p-4 mb-6"
                   style={{ background: 'var(--cream-dark)' }}>
                <div className="flex gap-3 items-start">
                  <div className="text-2xl">❤️</div>
                  <div>
                    <div className="font-medium text-sm mb-1" style={{ color: 'var(--forest)' }}>
                      Your Impact
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      ₹{impact} from this order will support community development programs
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>100% Compostable Materials</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Easy Returns & Refunds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
