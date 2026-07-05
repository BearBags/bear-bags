'use client';
import React, { useState } from 'react';

const FAQ = () => {
  const [showAll, setShowAll] = useState(false);

  const toggleFaq = (e: React.MouseEvent<HTMLDivElement>) => {
    const item = e.currentTarget.parentElement;
    item?.classList.toggle("open");
  };

  const faqs = [
    {
      question: "Are Bear Bags approved by the government?",
      answer: "Yes. Bear Bags are CPCB certified compostable bags and comply with applicable compostability requirements in India. Bear Bags are also TÜV Austria certified for industrial compostability, meeting internationally recognized compostability standards."
    },
    {
      question: "How long does Bear Bags take to decompose?",
      answer: "Bear Bags break down under composting conditions. The exact decomposition time depends on temperature,  moisture, and composting environment, but they are designed to decompose naturally without leaving microplastics behind."
    },
    {
      question: "What material are Bear Bags made from?",
      answer: "Bear Bags are made from compostable materials including corn starch–based components and certified compostable polymers designed for compostability and strength."
    },
    {
      question: "How strong are Bear Bags?",
      answer: "Bear Bags are engineered for real household use. They comfortably handle everyday wet and dry waste while remaining fully compostable—because sustainability shouldn't mean compromising on strength."
    },
    {
      question: "Why should I buy this when plastic bags are cheaper? It’s garbage anyway.",
      answer: "Regular plastic garbage bags stay in the environment for years and can leave microplastics behind. Bear Bags are designed for people who want a stronger alternative without adding more plastic waste. "
    },
    {
      question: "Why the name “Bear Bags”?",
      answer: "The bear represents strength — our core belief from day one. We wanted to build compostable bags that people choose because they are fit for real use, not just because they are sustainable."
    },
    {
      question: "What does the “30% profits pledged” commitment mean?",
      answer: "Bear Bags has pledged 30% of profits toward community development initiatives. Every contribution and impact update will be transparently documented on our Impact page as the brand grows."
    },
    {
      question: "What sizes are currently available?",
      answer: "Bear Bags are currently available in Medium (19 × 21 inches), designed to fit most everyday household bins. More sizes will be introduced as we grow."
    },
    {
      question: "Where can I buy Bear Bags?",
      answer: "Bear Bags are available on Amazon and through selected retail partners. We're gradually expanding our availability across India."
    },
    {
      question: " Do Bear Bags contain plastic?",
      answer: "No conventional plastic. Bear Bags are designed as certified compostable garbage bags."
    },
    {
      question: "Can Bear Bags be used for wet kitchen waste?",
      answer: "Yes. Bear Bags are designed for everyday household use and are suitable for wet and dry household waste handling."
    },
    {
      question: "Do Bear Bags leave microplastics behind?",
      answer: "No. Bear Bags are designed to decompose without leaving conventional plastic residue or microplastics behind."
    }
  ];

  return (
<section id="faq">
  <div className="faq-layout">
    <div className="faq-sidebar">
      <div className="section-label">FAQ</div>
      <h3>Questions customers ask most</h3>
      {/* <p>Have something else in mind? We&apos;re happy to chat.</p> */}
      <div className="faq-contact">
        <p>Still have a question? We&apos;d be happy to help</p>
        <a href="mailto:hello@bearbags.in">hello@bearbags.in</a><br/>
        <a href="https://wa.me/919131783440">WhatsApp: +91 91317 83440</a>
      </div>
    </div>

<div className="faq-list">
  {faqs
    .slice(0, showAll ? faqs.length : 6)
    .map((faq, index) => (
      <div
        key={index}
        className={`faq-item ${index === 0 ? "open" : ""}`}
      >
        <div
          className="faq-question"
          onClick={toggleFaq}
        >
          {faq.question}

          <div className="faq-toggle">+</div>
        </div>

        <div className="faq-answer">
          <div className="faq-answer-inner">
            {faq.answer}
          </div>
        </div>
      </div>
    ))}

  {/* READ MORE BUTTON */}
  {faqs.length > 6 && (
    <button
      onClick={() => setShowAll(!showAll)}
      className="mt-6 text-sm font-medium text-black hover:opacity-70 transition"
    >
      {showAll ? "Read Less ↑" : "Read More ↓"}
    </button>
  )}
</div>
  </div>
</section>

  );
};

export default FAQ;