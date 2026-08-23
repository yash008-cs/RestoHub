import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';

const PROMO_SLIDES = [
  {
    id: 1,
    tag: 'FREEDOM SALE',
    brand: 'RESTOHUB SPECIAL',
    title: 'Classic Pune style, best deals Min. 50% Off',
    subtitle: 'Step into authentic taste with Pune Spice Kitchen & Deccan Bites',
    bankBadge: '10% Instant Discount with HDFC / SBI Credit Cards',
    gradient: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #451a03 100%)',
    emoji: '🍱',
  },
  {
    id: 2,
    tag: 'SUPERFAST 20 MINS',
    brand: 'FAST & FRESH',
    title: 'Hot Misal & Dum Biryani Delivered Under 20 Mins',
    subtitle: 'Prepared live by verified Wakad, Baner & Kothrud kitchens',
    bankBadge: 'Free Delivery on all orders above ₹199',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #090d16 100%)',
    emoji: '🚀',
  },
  {
    id: 3,
    tag: 'CODE RESTO50',
    brand: 'FESTIVE CASHBACK',
    title: 'Flat ₹180 OFF + Up to 50% Instant Cashback',
    subtitle: 'Explore Koregaon Park, Viman Nagar & Aundh iconic outlets',
    bankBadge: 'Use promo code RESTO50 at checkout for maximum discount',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #172554 100%)',
    emoji: '🎁',
  },
];

export const FlipkartBannerCarousel = ({ onNavigateRestaurants }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide every 3.2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
  };

  return (
    <div className="flipkart-carousel-wrapper">
      <div className="flipkart-carousel-container">
        {/* Carousel Tracks */}
        <div
          className="flipkart-carousel-track"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {PROMO_SLIDES.map((slide) => (
            <div key={slide.id} className="flipkart-banner-slide">
              <div
                className="flipkart-banner-card-inner"
                style={{ background: slide.gradient }}
              >
                {/* Top Freedom Sale Badge */}
                <div className="flipkart-freedom-badge">
                  <Sparkles size={12} />
                  <span>{slide.tag}</span>
                </div>

                <div className="banner-slide-content">
                  <div className="banner-brand-pill">{slide.brand}</div>
                  <h2 className="banner-slide-title">{slide.title}</h2>
                  <p className="banner-slide-subtitle">{slide.subtitle}</p>

                  <button className="banner-explore-btn" onClick={onNavigateRestaurants}>
                    <span>Explore Deals</span>
                    <ArrowRight size={16} />
                  </button>

                  {/* Bank/Discount Offer Ribbon */}
                  <div className="banner-bank-ribbon">
                    <ShieldCheck size={16} color="#38bdf8" />
                    <span>{slide.bankBadge}</span>
                    <span className="ad-tag">AD</span>
                  </div>
                </div>

                {/* Big Visual Emoji/Icon Graphic */}
                <div className="banner-visual-graphic">
                  <span className="banner-emoji-icon">{slide.emoji}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Left & Right Arrow Buttons */}
        <button className="carousel-arrow arrow-left" onClick={handlePrev}>
          <ChevronLeft size={24} />
        </button>
        <button className="carousel-arrow arrow-right" onClick={handleNext}>
          <ChevronRight size={24} />
        </button>

        {/* Bottom Pagination Dots */}
        <div className="carousel-dots-bar">
          {PROMO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              className={`carousel-dot ${currentSlide === idx ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
};
