'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { getProductBySlug } from '@/lib/products';
import { getClientDiscountPercent, applyDiscount } from '@/lib/discount';

const GALLERY_IMAGES = [
  '/images/shop1.jpeg',
  '/images/shop2.jpg',
  '/images/shop3.jpg',
  '/images/shop4.jpg',
  '/images/shop5.jpg',
  '/images/shop6.jpg',
];

const page = () => {
  const product = getProductBySlug('medium-size-bag');
  const { addToCart, setBuyNowItem } = useCart();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<'subscribe' | 'oneTime'>('subscribe');
  const [quantity, setQuantity] = useState(1);
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setDiscountPercent(getClientDiscountPercent());
  }, []);

  useEffect(() => {
    if (!isLightboxOpen) return;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') setActiveImage((i) => (i - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
      if (e.key === 'ArrowRight') setActiveImage((i) => (i + 1) % GALLERY_IMAGES.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen]);

  if (!product) {
    return null;
  }

  const subscribePrice = Math.round(product.price * 0.9);
  const baseSelectedPrice = selectedOption === 'subscribe' ? subscribePrice : product.price;
  const activeDiscountPercent = discountPercent ?? 0;
  const selectedPrice = applyDiscount(baseSelectedPrice, activeDiscountPercent);

  const handleDecrease = () => setQuantity((value) => Math.max(value - 1, 1));
  const handleIncrease = () => setQuantity((value) => value + 1);

  const handlePrevImage = () =>
    setActiveImage((index) => (index - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  const handleNextImage = () => setActiveImage((index) => (index + 1) % GALLERY_IMAGES.length);

  const buildCartProduct = () => ({
    id: product.id,
    name: product.title,
    description: product.description,
    price: selectedPrice,
    icon: product.icon,
    option: selectedOption,
    size: product.bagSize,
    count: product.bagCount,
    discountPercent: activeDiscountPercent,
  });

  const handleAddToCart = () => {
    addToCart(buildCartProduct(), quantity);
  };

  const handleBuyNow = () => {
    setBuyNowItem(buildCartProduct(), quantity);
    router.push('/checkout');
  };

  return (
    <main className="bg-[#f4f4ec] min-h-screen py-16">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.05fr_0.95fr] items-start">

          {/* Left image + thumbnails */}
          <section className="space-y-6">
            <div className="overflow-hidden rounded-[34px] border border-[#d3e5c9] bg-white/90 p-6 shadow-[0_22px_56px_rgba(36,71,63,0.12)]">
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                aria-label="View full screen"
                className="relative mx-auto block h-[600px] w-full cursor-zoom-in overflow-hidden rounded-[28px]"
              >
                <Image
                  src={GALLERY_IMAGES[activeImage]}
                  alt={`${product.imageAlt} — view ${activeImage + 1}`}
                  fill
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  className="object-cover shadow-xl"
                  priority
                />
              </button>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handlePrevImage}
                aria-label="Previous image"
                className="grid h-11 w-11 flex-shrink-0 cursor-pointer place-items-center rounded-full bg-[#dbe9d7] text-[#23473f] shadow-sm transition hover:bg-[#c9ddc4]">
                <FiChevronLeft size={20} />
              </button>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {GALLERY_IMAGES.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`View image ${index + 1}`}
                    className={`relative h-20 w-20 cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                      activeImage === index ? 'border-[#23473f] ring-2 ring-[#23473f]/40' : 'border-[#cfe2cf]'
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleNextImage}
                aria-label="Next image"
                className="grid h-11 w-11 flex-shrink-0 cursor-pointer place-items-center rounded-full bg-[#dbe9d7] text-[#23473f] shadow-sm transition hover:bg-[#c9ddc4]">
                <FiChevronRight size={20} />
              </button>
            </div>
          </section>

          {/* Right details */}
          <section className="space-y-6">
            <div className="space-y-3">
              <span className="inline-block rounded-full bg-[#23473f] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
                {product.highlight}
              </span>

              <h1 className="text-4xl font-semibold tracking-tight text-[#134632] sm:text-5xl">
                {product.title}
              </h1>

              {(product.rating || product.orders) && (
                <div className="flex flex-wrap items-center gap-3 text-sm text-[#555]">
                  {product.rating && (
                    <span className="flex items-center gap-1 font-medium text-[#23473f]">
                      {'★'.repeat(Math.round(product.rating))}
                      {'☆'.repeat(5 - Math.round(product.rating))}
                      <span className="ml-1 text-[#555]">{product.rating}</span>
                    </span>
                  )}
                  {product.rating && product.orders && <span className="text-[#c7d7c7]">|</span>}
                  {product.orders && <span>{product.orders}</span>}
                </div>
              )}

              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold text-[#c82b2d]">₹{selectedPrice}</p>
                {activeDiscountPercent > 0 && (
                  <>
                    <p className="text-base text-[#999] line-through">₹{baseSelectedPrice}</p>
                    <span className="rounded-full bg-[#dbe9d7] px-3 py-1 text-xs font-semibold text-[#23473f]">
                      {activeDiscountPercent}% off
                    </span>
                  </>
                )}
              </div>

              <p className="text-sm text-[#555]">
                {product.bagSize} · {product.bagCount} bags per pack
                {product.perBag && <span className="text-[#999]"> · {product.perBag}</span>}
              </p>

              <div className="flex flex-wrap gap-2">
                {product.inStock && (
                  <span className="rounded-full border border-[#d3e5c9] bg-white px-3 py-1.5 text-xs font-medium text-[#23473f]">
                     {product.inStock}
                  </span>
                )}
                {product.freeDelivery && (
                  <span className="rounded-full border border-[#d3e5c9] bg-white px-3 py-1.5 text-xs font-medium text-[#23473f]">
                     {product.freeDelivery}
                  </span>
                )}
              </div>
            </div>

            {/* Purchase option toggle */}
            {/* <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSelectedOption('subscribe')}
                className={`cursor-pointer rounded-2xl border p-4 text-left transition ${
                  selectedOption === 'subscribe'
                    ? 'border-[#23473f] bg-[#eef6ea] shadow-sm'
                    : 'border-[#d1ddcf] bg-white'
                }`}
              >
                <div className="text-sm font-semibold text-[#134632]">{product.subscriptionLabel}</div>
                <div className="mt-1 text-xs text-[#666]">{product.subscriptionDetails}</div>
                <div className="mt-2 text-sm font-semibold text-[#23473f]">₹{subscribePrice}</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOption('oneTime')}
                className={`cursor-pointer rounded-2xl border p-4 text-left transition ${
                  selectedOption === 'oneTime'
                    ? 'border-[#23473f] bg-[#eef6ea] shadow-sm'
                    : 'border-[#d1ddcf] bg-white'
                }`}
              >
                <div className="text-sm font-semibold text-[#134632]">{product.oneTimeLabel}</div>
                <div className="mt-1 text-xs text-[#666]">No commitment, order whenever you like.</div>
                <div className="mt-2 text-sm font-semibold text-[#23473f]">₹{product.price}</div>
              </button>
            </div> */}

            <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="flex items-center gap-1 rounded-3xl border border-[#d1ddcf] bg-white px-3 py-2 shadow-sm">
                <button
                  type="button"
                  onClick={handleDecrease}
                  className="h-10 w-10 rounded-2xl border border-[#c7d7c7] bg-[#f8fcf6] text-xl font-semibold text-[#23473f] cursor-pointer">
                  −
                </button>
                <span className="min-w-[48px] text-center text-lg font-semibold text-[#23473f]">{quantity}</span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  className="h-10 w-10 rounded-2xl border border-[#c7d7c7] bg-[#f8fcf6] text-xl font-semibold text-[#23473f] cursor-pointer">
                  +
                </button>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="inline-flex cursor-pointer h-14 w-full items-center justify-center rounded-full bg-[#f7d843] px-6 text-base font-semibold text-[#1f3a2d] shadow-md transition hover:bg-[#f7dd54]">
                  Add to Cart - ₹{selectedPrice * quantity}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="inline-flex cursor-pointer h-14 w-full items-center justify-center rounded-full bg-[#23473f] px-6 text-base font-semibold text-white shadow-md transition hover:bg-[#1a352f]">
                  Buy Now
                </button>
              </div>
            </div>

            <div className="rounded-[30px] border border-[#dbe7d2] bg-white p-6 shadow-sm">
              <button className="text-sm font-semibold text-[#23473f] underline underline-offset-4">
                Description
              </button>
              <p className="mt-4 text-sm leading-7 text-[#555]">
                {product.summary}
              </p>
              <ul className="mt-4 space-y-3 text-sm text-[#555]">
                {product.details.map((detail) => (
                  <li key={detail} className="flex gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#23473f]" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            {/* <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-2xl border border-[#dbe7d2] bg-white px-4 py-3 text-xs font-medium text-[#23473f]">
                🌱 100% Compostable
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-[#dbe7d2] bg-white px-4 py-3 text-xs font-medium text-[#23473f]">
                🔒 Secure Checkout
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-[#dbe7d2] bg-white px-4 py-3 text-xs font-medium text-[#23473f]">
                ↩ Easy Returns & Refunds
              </div>
            </div> */}
          </section>
        </div>
      </div>

      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-10"
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close full screen view"
            className="absolute top-4 right-4 grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <FiX size={24} />
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
            aria-label="Previous image"
            className="absolute left-4 grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <FiChevronLeft size={24} />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative h-[80vh] w-full max-w-4xl"
          >
            <Image
              src={GALLERY_IMAGES[activeImage]}
              alt={`${product.imageAlt} — full screen view ${activeImage + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-contain"
              priority
            />
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
            aria-label="Next image"
            className="absolute right-4 grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <FiChevronRight size={24} />
          </button>
        </div>
      )}
    </main>
  );
};

export default page;
