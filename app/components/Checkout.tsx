'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { TiShoppingCart } from "react-icons/ti";
import { FiLock, FiCheckCircle, FiCheck, FiTruck, FiPackage, FiInfo, FiTag } from "react-icons/fi";
import { normalizeCoupon, type Coupon } from '@/lib/discount';
import CopyableCode from './CopyableCode';

const SHIPPING_DETAILS_KEY = 'bearbags_shipping_details';

interface ServerPricing {
  subtotal: number;
  shipping: number;
  total: number;
  discountPercent: number;
  discountAmount: number;
  appliedCoupon: string | null;
  eligibleTierPercent: number;
  eligibleCoupons: Coupon[];
}

const isCompleteEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const iconProps = { 'aria-hidden': true, className: 'h-[22px] w-[22px]' };

const TRUST_BADGES = [
  {
    title: 'Free Delivery',
    subtitle: 'On all orders',
    icon: <FiTruck {...iconProps} />,
  },
  {
    title: 'Secure Payments',
    subtitle: 'Powered by Razorpay',
    icon: <FiLock {...iconProps} />,
  },
  {
    title: 'Refunds & Replacements',
    subtitle: 'For eligible order issues',
    icon: <FiPackage {...iconProps} />,
  },
];

// Numbered badge that heads each checkout step.
function StepNumber({ n }: { n: number }) {
  return (
    <span
      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
      style={{ background: 'var(--forest)' }}>
      {n}
    </span>
  );
}

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
  const [serverPricing, setServerPricing] = useState<ServerPricing | null>(null);
  // The coupon the buyer has actually applied. Nothing is discounted until this
  // is set, and it is what gets sent with the order.
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponPending, setCouponPending] = useState(false);
  const [justApplied, setJustApplied] = useState(false);
  // True when the form was filled from a previous visit's saved details, so the
  // buyer is told why rather than finding their email already there.
  const [usingSavedDetails, setUsingSavedDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'online'
  });

  // Shipping details persist across visits so a returning buyer does not retype
  // them. Restored on mount rather than in useState so server and first client
  // render agree; cleared once an order is placed.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SHIPPING_DETAILS_KEY);
      if (saved) {
        setFormData((prev) => ({ ...prev, ...JSON.parse(saved) }));
        setUsingSavedDetails(true);
      }
    } catch {
      // corrupt or unavailable storage -- fall back to an empty form
    }
  }, []);

  useEffect(() => {
    // Skip a blank form so the post-order reset does not re-save what
    // resetForm just cleared.
    const hasDetails = Object.entries(formData).some(
      ([key, value]) => key !== 'paymentMethod' && value !== '',
    );
    if (!hasDetails) return;
    try {
      localStorage.setItem(SHIPPING_DETAILS_KEY, JSON.stringify(formData));
    } catch {
      // storage full or blocked -- persistence is a convenience, not required
    }
  }, [formData]);

  // The parent builds `cartItems` inline, so it is a new array on every render
  // and cannot be an effect dependency -- the pricing effect would re-run and
  // cancel its own in-flight request forever, and the applied coupon would
  // never show. Key off the contents instead.
  const cartSignature = JSON.stringify(
    cartItems.map((item) => [item.product.id, item.product.option ?? '', item.quantity]),
  );

  // Debounced so typing an email address does not fire a request per keystroke.
  useEffect(() => {
    if (!isCompleteEmail(formData.email) || cartItems.length === 0) {
      setServerPricing(null);
      return;
    }

    let cancelled = false;
    // The code this request is asking about, so a response that arrives after
    // the buyer changed the coupon is not mistaken for a verdict on the new one.
    const requestedCoupon = appliedCoupon;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, cartItems, couponCode: requestedCoupon }),
        });
        if (!res.ok) return;
        const data: ServerPricing = await res.json();
        if (cancelled) return;
        setServerPricing(data);
        // The server has the final say on eligibility: if it declined the code
        // (wrong tier for this email, or an expired campaign), drop it so the
        // summary never shows a saving that will not be charged.
        if (requestedCoupon && !data.appliedCoupon) {
          setAppliedCoupon(null);
          setCouponError('That coupon isn’t available for this email.');
        }
      } catch {
        // Leave the local estimate in place; the order routes still price
        // authoritatively server-side when the buyer pays.
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // cartItems is intentionally not a dependency -- see cartSignature above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.email, cartSignature, appliedCoupon]);

  // Cart prices are full price. A discount exists only once the buyer applies a
  // coupon, at which point the server's figures drive the summary so it always
  // matches what Razorpay will charge.
  const localSubtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = 0; // free shipping on all orders
  const subtotal = serverPricing?.subtotal ?? localSubtotal;
  const total = serverPricing?.total ?? localSubtotal + shipping;
  const discountPercent = serverPricing?.discountPercent ?? 0;
  const discountAmount = serverPricing?.discountAmount ?? 0;
  const eligibleCoupons = serverPricing?.eligibleCoupons ?? [];

  const unitPriceFor = (item: (typeof cartItems)[number]): number => item.product.price;

  const applyCouponCode = async (rawCode: string) => {
    const code = normalizeCoupon(rawCode);
    if (!code) {
      setCouponError('Enter a coupon code.');
      return;
    }
    if (!isCompleteEmail(formData.email)) {
      setCouponError('Enter your email above before applying a coupon.');
      return;
    }

    setCouponPending(true);
    setCouponError(null);
    try {
      const res = await fetch('/api/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code, cartItems }),
      });
      const data = await res.json();
      if (!data?.valid) {
        setCouponError(data?.error ?? 'Could not apply that coupon.');
        setCouponPending(false);
        return;
      }
      setAppliedCoupon(data.code);
      setCouponInput(data.code);
      // The coupon route already priced this cart, so show the saving now
      // rather than leaving the summary stale until the debounced pricing
      // request catches up.
      setServerPricing((prev) =>
        prev
          ? {
              ...prev,
              subtotal: data.subtotal ?? prev.subtotal,
              total: data.total ?? prev.total,
              discountPercent: data.discountPercent ?? 0,
              discountAmount: data.discountAmount ?? 0,
              appliedCoupon: data.code,
            }
          : prev,
      );
      // Briefly flag the success so the saving reads as a result of their action.
      setJustApplied(true);
      setTimeout(() => setJustApplied(false), 2500);
    } catch {
      setCouponError('Could not reach the server. Please try again.');
    } finally {
      setCouponPending(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
  };

  const resetForm = () => {
    setUsingSavedDetails(false);
    try {
      localStorage.removeItem(SHIPPING_DETAILS_KEY);
    } catch {
      // storage unavailable -- the state reset below is what actually matters
    }
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
        body: JSON.stringify({ formData, cartItems, couponCode: appliedCoupon }),
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
              body: JSON.stringify({ formData, cartItems, couponCode: appliedCoupon, ...response }),
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
          <div className="flex justify-center text-[60px] md:text-[80px] mb-6"><TiShoppingCart /></div>
          <h2 className="font-['Playfair_Display'] text-[28px] md:text-[36px] font-bold mb-4"
              style={{ color: 'var(--forest)' }}>
            Your cart is empty
          </h2>
          <p className="text-base md:text-lg mb-8" style={{ color: 'var(--text-muted)' }}>
            Add some Bear Bags to get started!
          </p>
          <a href="/medium-size-bag"
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
          <div className="flex justify-center text-[60px] md:text-[80px] mb-6" style={{ color: 'var(--forest-light)' }}>
            <FiCheckCircle aria-hidden="true" />
          </div>
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
        {/* Header: title on the left, reassurance on the right */}
        <div className="mb-6 flex flex-col gap-5 md:mb-8 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="font-['Playfair_Display'] text-[32px] md:text-[42px] font-bold leading-none"
                style={{ color: 'var(--forest)' }}>
              Checkout
            </h1>
         
          </div>

          <div className="flex flex-wrap gap-5 sm:gap-7">
            {TRUST_BADGES.map(({ title, subtitle, icon }) => (
              <div key={title} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex-shrink-0" style={{ color: 'var(--forest)' }}>{icon}</span>
                <div className="leading-tight">
                  <div className="text-[13px] font-semibold" style={{ color: 'var(--forest)' }}>{title}</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Steps */}
          <div className="lg:col-span-2">
            <div className="rounded-[24px] p-4 md:p-7"
                 style={{ background: 'white', border: '1px solid rgba(26,58,42,0.08)' }}>

              {/* 1 — Your Items */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StepNumber n={1} />
                  <h2 className="text-[17px] font-semibold" style={{ color: 'var(--forest)' }}>
                    Your Items
                  </h2>
                </div>
                <a href="/cart" className="text-[13px] underline underline-offset-2"
                   style={{ color: 'var(--forest)' }}>
                  Edit
                </a>
              </div>

              {!!appliedCoupon && discountPercent > 0 && (
                <p className="mb-3 flex items-center gap-1.5 text-sm font-medium"
                   style={{ color: 'var(--forest-light)' }}>
                  <FiCheckCircle aria-hidden="true" className="h-4 w-4 flex-shrink-0" />
                  {appliedCoupon} applied — {discountPercent}% off this order
                </p>
              )}

              <div className="space-y-2.5">
                {cartItems.map((item) => (
                  <div key={`${item.product.id}-${item.product.option ?? 'default'}`}
                       className="flex items-center gap-3.5 rounded-2xl p-3"
                       style={{ background: '#f4f6f1' }}>
                    <div className="relative h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-xl"
                         style={{ background: 'var(--cream-dark)' }}>
                      {item.product.icon?.startsWith('/') ? (
                        <Image src={item.product.icon} alt={item.product.name} fill sizes="60px" className="object-contain" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-2xl">{item.product.icon}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-semibold" style={{ color: 'var(--forest)' }}>
                        {item.product.name}
                      </h3>
                      <p className="mt-0.5 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                        {(item.product.size ?? 'Bag')} · {item.product.count ?? item.quantity} bags per roll
                      </p>

                      {isBuyNow ? (
                        <p className="mt-1 text-[13px] font-semibold" style={{ color: 'var(--forest)' }}>
                          Qty: {item.quantity}
                        </p>
                      ) : (
                        <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
                          <div className="flex items-center overflow-hidden rounded-lg border bg-white"
                               style={{ borderColor: 'rgba(26,58,42,0.15)' }}>
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1), item.product.option)}
                              className="cursor-pointer px-2.5 py-0.5 text-sm transition-colors hover:bg-black/5"
                              style={{ color: 'var(--forest)' }}>
                              −
                            </button>
                            <span className="min-w-[26px] text-center text-[13px] font-semibold"
                                  style={{ color: 'var(--forest)' }}>
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.product.option)}
                              className="cursor-pointer px-2.5 py-0.5 text-sm transition-colors hover:bg-black/5"
                              style={{ color: 'var(--forest)' }}>
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.product.id, item.product.option)}
                            className="text-[12px] opacity-60 transition-opacity hover:opacity-100"
                            style={{ color: 'var(--destructive)' }}>
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <div className="text-[15px] font-bold" style={{ color: 'var(--forest)' }}>
                        ₹{unitPriceFor(item) * item.quantity}
                      </div>
                      <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        ₹{unitPriceFor(item)} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                {/* 2 — Contact Details */}
                <div className="mt-7 flex items-center gap-3">
                  <StepNumber n={2} />
                  <div>
                    <h2 className="text-[17px] font-semibold" style={{ color: 'var(--forest)' }}>
                      Contact Details
                    </h2>
                    <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      We&apos;ll use this to check for available offers and keep you updated on your order.
                    </p>
                  </div>
                </div>

                {/* Says why the form came back filled in, and offers a way out. */}
                {usingSavedDetails && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
                       style={{ background: 'rgba(26,58,42,0.04)' }}>
                    <span className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      <FiCheck aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0"
                               style={{ color: 'var(--forest-light)' }} />
                      Using the details you saved last time.
                    </span>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-shrink-0 cursor-pointer text-[12px] font-medium underline underline-offset-2"
                      style={{ color: 'var(--forest)' }}>
                      Clear
                    </button>
                  </div>
                )}

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      Email address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl border px-3.5 py-2.5 pr-9 text-sm outline-none transition-colors"
                        style={{ borderColor: 'rgba(26,58,42,0.15)' }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--forest)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(26,58,42,0.15)')}
                      />
                      {isCompleteEmail(formData.email) && (
                        <FiCheck aria-hidden="true"
                                 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                                 style={{ color: 'var(--forest-light)' }} />
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      Phone number
                    </label>
                    <div className="relative">
                      <input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-xl border px-3.5 py-2.5 pr-9 text-sm outline-none transition-colors"
                        style={{ borderColor: 'rgba(26,58,42,0.15)' }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--forest)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(26,58,42,0.15)')}
                      />
                      {formData.phone.replace(/\D/g, '').length >= 10 && (
                        <FiCheck aria-hidden="true"
                                 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                                 style={{ color: 'var(--forest-light)' }} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Recognised returning buyer: the tier coupon is theirs to claim. */}
                {isCompleteEmail(formData.email) && serverPricing && (
                  <div className="mt-3 flex items-start gap-2.5 rounded-xl p-3"
                       style={{ background: 'rgba(45,106,79,0.08)' }}>
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-white"
                          style={{ background: 'var(--forest-light)' }}>
                      <FiCheck aria-hidden="true" className="h-3 w-3" />
                    </span>
                    <div className="leading-tight">
                      <div className="text-[13px] font-semibold" style={{ color: 'var(--forest)' }}>
                        {serverPricing.eligibleTierPercent === 7 ? 'Welcome!' : 'Welcome back!'}
                      </div>
                      <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                        {serverPricing.eligibleTierPercent === 7
                          ? 'Your first-order offer is ready below.'
                          : 'We found your past orders — your returning offer is ready below.'}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3 — Shipping Details */}
                <div className="mt-7 flex items-center gap-3">
                  <StepNumber n={3} />
                  <h2 className="text-[17px] font-semibold" style={{ color: 'var(--forest)' }}>
                    Shipping Details
                  </h2>
                </div>

                <div className="mt-3 space-y-3">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      Full name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors"
                      style={{ borderColor: 'rgba(26,58,42,0.15)' }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--forest)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(26,58,42,0.15)')}
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="mb-1.5 block text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors"
                      style={{ borderColor: 'rgba(26,58,42,0.15)' }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--forest)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(26,58,42,0.15)')}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="city" className="mb-1.5 block text-[12px]" style={{ color: 'var(--text-muted)' }}>
                        City
                      </label>
                      <input
                        id="city"
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors"
                        style={{ borderColor: 'rgba(26,58,42,0.15)' }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--forest)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(26,58,42,0.15)')}
                      />
                    </div>
                    <div>
                      <label htmlFor="pincode" className="mb-1.5 block text-[12px]" style={{ color: 'var(--text-muted)' }}>
                        Pincode
                      </label>
                      <input
                        id="pincode"
                        type="text"
                        required
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors"
                        style={{ borderColor: 'rgba(26,58,42,0.15)' }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--forest)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(26,58,42,0.15)')}
                      />
                    </div>
                  </div>
                </div>

                {/* 4 — Payment Method */}
                <div className="mt-7 flex items-center gap-3">
                  <StepNumber n={4} />
                  <div>
                    <h2 className="text-[17px] font-semibold" style={{ color: 'var(--forest)' }}>
                      Payment Method
                    </h2>
                    <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      Secure and encrypted payments powered by Razorpay.
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3 rounded-xl border p-3.5"
                     style={{ borderColor: 'var(--forest)' }}>
                  <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border-[2px]"
                        style={{ borderColor: 'var(--forest)' }}>
                    <span className="h-2 w-2 rounded-full" style={{ background: 'var(--forest)' }} />
                  </span>
                  <div className="flex-1 leading-tight">
                    <div className="text-[14px] font-semibold" style={{ color: 'var(--forest)' }}>Online Payment</div>
                    <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>UPI, Cards, Net Banking</div>
                  </div>
                  <div className="hidden flex-shrink-0 items-center gap-2 text-[11px] font-bold sm:flex"
                       style={{ color: 'var(--text-muted)' }}>
                    <span style={{ color: '#0c2451' }}>UPI</span>
                    <span style={{ color: '#1a1f71' }}>VISA</span>
                    <span style={{ color: '#eb001b' }}>●●</span>
                    <span style={{ color: '#0f4a8a' }}>RuPay</span>
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
                  className="mt-5 w-full cursor-pointer rounded-full px-8 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  style={{ background: 'var(--forest)', color: 'white' }}>
                  {isProcessingPayment ? (
                    <span className="text-[15px] font-semibold">Processing payment…</span>
                  ) : (
                    <>
                      <span className="block text-[15px] font-semibold leading-tight">Pay ₹{total}</span>
                      <span className="mt-0.5 flex items-center justify-center gap-1 text-[11px] font-normal opacity-80">
                        <FiLock aria-hidden="true" className="h-3 w-3" />
                        Secure Checkout
                      </span>
                    </>
                  )}
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

                {/* The saving gets its own line, in green, so it reads as money
                    the buyer claimed rather than a price that was never full. */}
                {!!appliedCoupon && discountAmount > 0 && (
                  <div className="flex justify-between text-sm font-medium" style={{ color: 'var(--forest-light)' }}>
                    <span>{appliedCoupon} ({discountPercent}%)</span>
                    <span>−₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                  <span className="font-medium" style={{ color: 'var(--forest-light)' }}>FREE</span>
                </div>

                <div className="pt-3 border-t flex justify-between items-center"
                     style={{ borderColor: 'rgba(26,58,42,0.1)' }}>
                  <span className="font-medium" style={{ color: 'var(--forest)' }}>Total</span>
                  <span className="font-['Playfair_Display'] text-[24px] font-bold"
                        style={{ color: 'var(--forest)' }}>
                    ₹{total}
                  </span>
                </div>

                {/* Available for you */}
                <div className="pt-4 border-t" style={{ borderColor: 'rgba(26,58,42,0.1)' }}>
                  <div className="mb-3 flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--forest)' }}>
                      Available for you
                    </h3>
                    <span
                      title="Offers you qualify for, based on your email and any running promotions."
                      aria-label="Offers you qualify for, based on your email and any running promotions."
                      className="flex cursor-help items-center justify-center"
                      style={{ color: 'var(--forest)' }}>
                      <FiInfo aria-hidden="true" className="h-4 w-4" />
                    </span>
                  </div>

                  {!isCompleteEmail(formData.email) ? (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Enter your email to see the offers you qualify for.
                    </p>
                  ) : eligibleCoupons.length === 0 ? (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      No offers available on this order right now.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {eligibleCoupons.map((coupon) => {
                        const isApplied = appliedCoupon === coupon.code;
                        return (
                          <div
                            key={coupon.code}
                            className="flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors"
                            style={{
                              borderColor: isApplied ? 'var(--forest-light)' : 'rgba(26,58,42,0.12)',
                              background: isApplied ? 'rgba(45,106,79,0.06)' : 'white',
                            }}>
                            <div className="flex min-w-0 items-start gap-2.5">
                              <FiTag
                                aria-hidden="true"
                                className="mt-0.5 h-[18px] w-[18px] flex-shrink-0"
                                style={{ color: 'var(--forest)' }} />
                              <div className="min-w-0">
                                <div className="text-sm font-semibold" style={{ color: 'var(--forest)' }}>
                                  <CopyableCode code={coupon.code} /> · {coupon.percent}% off
                                </div>
                                <p className="mt-0.5 text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>
                                  {coupon.blurb}
                                </p>
                              </div>
                            </div>

                            {isApplied ? (
                              <span
                                className="flex flex-shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                                style={{ background: 'rgba(45,106,79,0.12)', color: 'var(--forest-light)' }}>
                                <FiCheck aria-hidden="true" className="h-3.5 w-3.5" />
                                Applied
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => applyCouponCode(coupon.code)}
                                disabled={couponPending}
                                className="flex-shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                                style={{ background: 'var(--forest)', color: 'white' }}>
                                Use code
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Coupon code entry */}
                <div className="pt-4 border-t" style={{ borderColor: 'rgba(26,58,42,0.1)' }}>
                  <label htmlFor="coupon" className="mb-2 block text-sm font-medium" style={{ color: 'var(--forest)' }}>
                    Coupon code
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="coupon"
                      type="text"
                      value={couponInput}
                      placeholder="Enter code"
                      readOnly={!!appliedCoupon}
                      aria-describedby="coupon-note"
                      aria-invalid={!!couponError}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        if (couponError) setCouponError(null);
                      }}
                      onKeyDown={(e) => {
                        // Enter would otherwise submit the checkout form.
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!appliedCoupon) applyCouponCode(couponInput);
                        }
                      }}
                      className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm font-medium uppercase tracking-wide outline-none transition-colors focus:border-[color:var(--forest-light)]"
                      style={{
                        borderColor: couponError ? '#c82b2d' : 'rgba(26,58,42,0.15)',
                        background: appliedCoupon ? 'rgba(45,106,79,0.06)' : 'white',
                        color: 'var(--forest)',
                      }}
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="flex-shrink-0 cursor-pointer rounded-xl border px-3 py-2 text-sm font-medium transition-colors hover:bg-[rgba(26,58,42,0.04)]"
                        style={{ borderColor: 'rgba(26,58,42,0.15)', color: 'var(--text-muted)' }}>
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => applyCouponCode(couponInput)}
                        disabled={couponPending || !couponInput.trim()}
                        className="flex-shrink-0 cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                        style={{ background: 'var(--forest)', color: 'white' }}>
                        {couponPending ? '…' : 'Apply'}
                      </button>
                    )}
                  </div>

                  <p
                    id="coupon-note"
                    role={couponError ? 'alert' : undefined}
                    aria-live="polite"
                    className="mt-2 flex items-start gap-1.5 text-xs"
                    style={{ color: couponError ? '#c82b2d' : 'var(--forest-light)' }}>
                    {couponError ? (
                      couponError
                    ) : appliedCoupon && discountAmount > 0 ? (
                      <>
                        <FiCheck aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                        <span>
                          Coupon applied. You saved ₹{discountAmount}.
                          {justApplied && <strong className="ml-1 font-semibold">Nice one!</strong>}
                        </span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>
                        Have a code? Enter it above to save on this order.
                      </span>
                    )}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
