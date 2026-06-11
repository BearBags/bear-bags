'use client';
import React, { useEffect, useRef } from "react";
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

const testimonials:Testimonial[] = [
  {
    type: "image",
    name: "Avisha",
    image: "/images/review/avisha_review.jpeg",
    quote:
      "100% Recommend. Very Very good quality bags, using it for my pets and kitchen, would totally recommend.",
    avatar: "A",
    rating: 5,
  },

  {
    type: "video",
    name: "Anoop",
    video: "/videos/anoop_review.MP4",
    quote:
      "I personally liked the bags. The price is a bit higher compared to the local options, but the product quality is good. The moment I first held the bag, it felt premium and sturdier than most garbage bags I have used. I also noticed that the roll itself is slightly heavier, which I actually liked. The bag length is perfect for my dustbin. The only thing I felt was missing is a tie string to close the bag",
    avatar: "A",
    rating: 4,
  },
   {
    type: "image",
    name: "Mekhala",
    image: "/images/review/mekhala_review.jpeg",
    quote:
      "Purchased these bear bags from Amazon, and the quality of these bags is visible, the bags are thick so do not anticipate any leakage, big enough to fit the dustbins properly and plus they are compostable. Only thing which I felt was missing was the string which helps tie the bag, but since the bags are big enough they can be tied without that. Overall happy with purchase.",
    avatar: "M",
    rating: 4.5,
  },
  {
    type: "image",
    name: "Sachin",
    image: "/images/review/sachin_review.jpeg",
    quote:
      "Great product! The bags are sturdy and handle daily waste without tearing. Reliable and well made, glad to have found a compostable option that doesn’t compromise on strength. Definitely worth the purchase",
      avatar: "S",
    rating: 5,
    },
    {
    type: "video",
    name: "Ayushi",
    video: "/videos/ayushi_review.mp4",
    quote:
      "Quality is good, strength is also good, can hold the household waste with ease.",
    avatar: "A",
    rating: 5,
  },
   {
    type: "image",
    name: "Anish",
    image: "/images/review/anish_review.jpeg",
    quote:
      "I orderd this Bear Bag from amazon. The packaging was really good. I always wanted to use compostable garbage bags but always had the issue with the quality . Bear Bag is really good , great build quality , good strength to be honest and we were able to fill it completely without it getting stretched. Would recommend it to folks interested to contribute to mother earth by purchasing compostable bags than plastic bags!",
    avatar: "M",
    rating: 5,
  },
  {
    type: "image",
    name: "Lavanya",
    image: "/images/review/lavanya_review.jpg",
    quote:
      "Good Quality biodegradable bags. Strong, practical and eco-friendly.",
      avatar: "L",
    rating: 5,
    },
];
interface TrackType {
  scrollWidth: number;
  style: {
    transform: string;
  }
}

const Testimonials = () => {
const trackRef = useRef<HTMLDivElement | null>(null);
const isPaused = useRef(false);

  useEffect(() => {
    let animationFrame: number;
    let position = 0;
    const speed = 0.5;

    const animate = () => {
      position -= speed;

      const track: TrackType | null = trackRef.current;

      if (track) {
        if(!isPaused.current) {
          position -= speed;
        
        const firstSetWidth = track.scrollWidth / 2;

        if (Math.abs(position) >= firstSetWidth) {
          position = 0;
        }

        track.style.transform = `translateX(${position}px)`;
      }
    }

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <section
      id="testimonials"
      className="py-24 bg-[#f8f8f6] overflow-hidden"
    >
      <div className="text-center mb-14 px-4">
        <p className="uppercase tracking-[0.2em] text-sm text-neutral-500 mb-3">
          Customer Reviews
        </p>

        <h2 className="text-4xl md:text-5xl font-semibold text-neutral-900">
          What people are saying
        </h2>
      </div>

      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-[#f8f8f6] to-transparent" />
        <div className="absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-[#f8f8f6] to-transparent" />

        <div
          ref={trackRef}
          className="flex w-max will-change-transform"
        >
          {[...testimonials, ...testimonials].map((item, index) => (
<div
  key={index}
  className="w-[350px] shrink-0 rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm mx-3"
    onMouseEnter={() => {
    isPaused.current = true;
  }}
  onMouseLeave={() => {
    isPaused.current = false;
  }}
>

  {/* IMAGE */}
  {item.type === "image" && item.image && (
    <div className="mb-5 overflow-hidden rounded-2xl">
      <img
        src={item.image}
        alt={item.name}
        className="h-[240px] w-full object-cover"
      />
    </div>
  )}

  {/* VIDEO */}
  {item.type === "video" && item.video && (
    <div className="mb-5 overflow-hidden rounded-2xl">
      <video
        src={item.video}
        autoPlay
        muted
        loop
        playsInline
        className="h-[240px] w-full object-cover"
      />
    </div>
  )}

  {/* <div className="mb-4 flex text-[#ffb400] text-lg">
   {item.rating}
  </div> */}

<div className="mb-4 flex items-center gap-1 text-[#ffb400] text-lg">
  {[...Array(Math.floor(item.rating))].map((_, i) => (
    <FaStar key={i} />
  ))}

  {item.rating % 1 !== 0 && <FaStarHalfAlt />}
</div>

  <p className="text-neutral-700 leading-7 mb-6">
    “{item.quote}”
  </p>

  <div className="flex items-center gap-4">

    {item.avatar ? (
      <div className="h-12 w-12 rounded-full bg-black text-white flex items-center justify-center font-semibold">
        {item.avatar}
      </div>
    ) : (
      <img
        src={item.image}
        alt={item.name}
        className="h-12 w-12 rounded-full object-cover"
      />
    )}

    <div>
      <h4 className="font-semibold text-neutral-900">
        {item.name}
      </h4>

      {/* <p className="text-sm text-neutral-500">
        {item.role}
      </p> */}
    </div>
  </div>
</div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;