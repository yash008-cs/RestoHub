import React from 'react';
import { Tag, Sparkles, Truck, ArrowRight } from 'lucide-react';
import { RealisticFire } from './RealisticFire';

export const OfferBanner = ({ onSelectOffer }) => {
  const offers = [
    {
      id: 1,
      tag: 'WELCOME OFFERS',
      title: '50% OFF up to ₹100',
      subtitle: 'Use code RESTO50 on your first order',
      code: 'RESTO50',
      bgClass: 'offer-card-red',
      img: '/banner-pizza-3d.png',
      icon: <Tag size={16} />,
    },
    {
      id: 2,
      tag: 'FREE DELIVERY',
      title: 'Zero Delivery Charge',
      subtitle: 'On orders above ₹199 across Pune',
      code: 'FREEDEL',
      bgClass: 'offer-card-purple',
      img: '/banner-roll-3d.png',
      icon: <Truck size={16} />,
    },
    {
      id: 3,
      tag: 'WEEKEND SPECIAL',
      title: 'Flat ₹150 Cashback',
      subtitle: 'On gourmet biryanis & combos',
      code: 'GOURMET150',
      bgClass: 'offer-card-blue',
      img: '/banner-biryani-3d.png',
      icon: <Sparkles size={16} />,
    },
  ];

  return (
    <section className="special-offers-section">
      <div className="section-header-flex">
        <div>
          <h2 className="section-main-title">
            <RealisticFire size={28} />
            <span>Best Offers &amp; Deals</span>
          </h2>
          <p className="section-subtitle">Tap any deal card below to view eligible food items &amp; apply offer code</p>
        </div>
      </div>

      <div className="offers-grid-row">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`offer-promo-card ${offer.bgClass} clickable-offer-card`}
            onClick={() => onSelectOffer && onSelectOffer(offer.code)}
            title={`View food items eligible for ${offer.title}`}
          >
            <div className="offer-text-meta">
              <span className="offer-tag-pill">
                {offer.icon} {offer.tag}
              </span>
              <h3 className="offer-title">{offer.title}</h3>
              <p className="offer-subtext">{offer.subtitle}</p>
              <div className="offer-coupon-badge">
                CODE: {offer.code}
              </div>
            </div>

            {/* 3D Popout Food Plate Graphic */}
            <div className="offer-popout-graphic-container">
              <img src={offer.img} alt={offer.title} className="offer-popout-food-img" loading="lazy" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
