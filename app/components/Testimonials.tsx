'use client';
import { useEffect, useRef, useState } from "react";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

interface Testimonial {
  type: "image" | "video";
  name: string;
  image?: string;
  video?: string;
  quote: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    type: "image",
    name: "Avisha",
    image: "/images/review/avisha_review.jpeg",
    quote: "100% Recommend. Very Very good quality bags, using it for my pets and kitchen, would totally recommend.",
    avatar: "A",
    rating: 5,
  },
  {
    type: "video",
    name: "Anoop",
    video: "/videos/anoop_review.MP4",
    quote: "I personally liked the bags. The price is a bit higher compared to the local options, but the product quality is good. The moment I first held the bag, it felt premium and sturdier than most garbage bags I have used.",
    avatar: "A",
    rating: 4,
  },
  {
    type: "image",
    name: "Mekhala",
    image: "/images/review/mekhala_review.jpeg",
    quote: "Purchased these bear bags from Amazon, and the quality of these bags is visible, the bags are thick so do not anticipate any leakage, big enough to fit the dustbins properly and plus they are compostable.",
    avatar: "M",
    rating: 4.5,
  },
  {
    type: "image",
    name: "Sachin",
    image: "/images/review/sachin_review.jpeg",
    quote: "Great product! The bags are sturdy and handle daily waste without tearing. Reliable and well made, glad to have found a compostable option that doesn't compromise on strength.",
    avatar: "S",
    rating: 5,
  },
  {
    type: "image",
    name: "Amazon Vine Review",
    image: "/images/review/amazon_vine_review.png",
    quote: "These compostable garbage bags exceeded my expectations. Unlike many eco-friendly bags that can feel thin or rough, these have a much more premium feel, they're soft to the touch, flexible, and well-made. Despite being soft, they're also quite sturdy and handle both dry and wet waste without tearing easily during regular use. The size is perfect for everyday household bins, and the perforations between bags are clean, making them easy to separate from the roll. It's nice to see that they're CPCB and TÜV certified, which gives confidence that they're genuinely compostable and not just marketed as eco-friendly. One thing I would have liked is a built-in drawstring or tie closure to make sealing and disposing of the waste more convenient, but that's a minor gripe given the overall quality. Overall, these bags strike a great balance between sustainability, durability, and premium feel. A solid choice for anyone looking to switch to eco-friendly garbage bags without compromising on quality.",
    avatar: "A",
    rating: 4,
  },
  {
    type: "video",
    name: "Ayushi",
    video: "/videos/ayushi_review.mp4",
    quote: "Quality is good, strength is also good, can hold the household waste with ease.",
    avatar: "A",
    rating: 5,
  },
  {
    type: "image",
    name: "Anish",
    image: "/images/review/anish_review.jpeg",
    quote: "Bear Bag is really good, great build quality, good strength and we were able to fill it completely without it getting stretched. Would recommend it to folks interested to contribute to mother earth!",
    avatar: "M",
    rating: 5,
  },
  {
    type: "image",
    name: "Lavanya",
    image: "/images/review/lavanya_review.jpg",
    quote: "Good Quality biodegradable bags. Strong, practical and eco-friendly.",
    avatar: "L",
    rating: 5,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="mb-4 flex items-center gap-1 text-[#ffb400] text-lg">
      {[...Array(Math.floor(rating))].map((_, i) => <FaStar key={i} />)}
      {rating % 1 !== 0 && <FaStarHalfAlt />}
    </div>
  );
}

function TestimonialCard({ item }: { item: Testimonial }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-[300px] sm:w-[340px] shrink-0 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7 shadow-sm">
      {item.type === "image" && item.image && (
        <div className="mb-5 overflow-hidden rounded-2xl">
          <img src={item.image} alt={item.name} className="h-[200px] sm:h-[240px] w-full object-cover" />
        </div>
      )}
      {item.type === "video" && item.video && (
        <div className="mb-5 overflow-hidden rounded-2xl">
          <video src={item.video} autoPlay muted loop playsInline className="h-[200px] sm:h-[240px] w-full object-cover" />
        </div>
      )}
      <StarRating rating={item.rating} />
      <p className={`text-neutral-700 leading-7 text-sm sm:text-base ${expanded ? '' : 'line-clamp-5'}`}>
        "{item.quote}"
      </p>
      {item.quote.length > 180 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 mb-4 text-sm font-semibold text-[#1f3a2f] hover:underline"
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      )}
      <div className={`flex items-center gap-4 ${item.quote.length > 180 ? '' : 'mt-6'}`}>
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black text-white flex items-center justify-center font-semibold text-sm sm:text-base shrink-0">
          {item.avatar}
        </div>
        <h4 className="font-semibold text-neutral-900">{item.name}</h4>
      </div>
    </div>
  );
}

const Testimonials = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let raf: number;
    let pos = 0;
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (!paused) {
        pos += 0.5;
        const half = el.scrollWidth / 2;
        if (pos >= half) pos = 0;
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(tick);
    };

    const pause = () => {
      paused = true;
      clearTimeout(resumeTimer);
    };

    const resume = () => {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        // sync pos to wherever the user scrolled before resuming animation
        pos = el.scrollLeft;
        paused = false;
      }, 1500);
    };

    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    el.addEventListener('touchstart', pause, { passive: true });
    el.addEventListener('touchend', resume, { passive: true });

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resumeTimer);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
      el.removeEventListener('touchstart', pause);
      el.removeEventListener('touchend', resume);
    };
  }, []);

  return (
    <section id="testimonials" className="bg-[#f8f8f6] overflow-hidden">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14 px-4">
        <p className="uppercase tracking-[0.2em] text-xs sm:text-sm text-neutral-500 mb-3">
          Customer Reviews
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-neutral-900">
          Real reviews. Real homes.
        </h2>
      </div>

      {/* Auto-scroll + touch/mouse scrollable — all screen sizes */}
      <div className="relative">
        <div className="absolute left-0 top-0 z-10 h-full w-16 sm:w-24 bg-gradient-to-r from-[#f8f8f6] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 z-10 h-full w-16 sm:w-24 bg-gradient-to-l from-[#f8f8f6] to-transparent pointer-events-none" />

        <div ref={containerRef} className="overflow-x-auto no-scrollbar">
          <div className="flex gap-4 px-5 sm:px-8 pb-4 w-max">
            {[...testimonials, ...testimonials].map((item, index) => (
              <TestimonialCard key={index} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
