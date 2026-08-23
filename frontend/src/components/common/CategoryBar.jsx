import React from 'react';
import { getCategoryImage, handleImageError } from '../../utils/imageMapper';

export const CATEGORIES_LIST = [
  { id: 'biryani', name: 'Biryani', icon: '🍲', label: 'Biryani' },
  { id: 'pizza', name: 'Pizza', icon: '🍕', label: 'Pizza' },
  { id: 'burger', name: 'Burger', icon: '🍔', label: 'Burger' },
  { id: 'south-indian', name: 'South Indian', icon: '🫓', label: 'South Indian' },
  { id: 'chinese', name: 'Chinese', icon: '🥢', label: 'Chinese' },
  { id: 'north-indian', name: 'North Indian', icon: '🥘', label: 'North Indian' },
  { id: 'maharashtrian', name: 'Maharashtrian', icon: '🚩', label: 'Maharashtrian' },
  { id: 'snacks', name: 'Snacks', icon: '🍟', label: 'Snacks' },
  { id: 'desserts', name: 'Desserts', icon: '🍰', label: 'Desserts' },
  { id: 'beverages', name: 'Beverages', icon: '🥤', label: 'Beverages' },
];

export const CategoryBar = ({ selectedCategory, onSelectCategory }) => {
  return (
    <section className="explore-categories-section" id="explore-categories">
      <div className="section-header-flex">
        <div>
          <h2 className="section-main-title">🍛 What's on your mind?</h2>
          <p className="section-subtitle">Explore top cuisines and dishes near you in Pune</p>
        </div>
        {selectedCategory !== 'ALL' && (
          <button
            className="reset-category-btn"
            onClick={() => onSelectCategory('ALL')}
          >
            Show All Dishes
          </button>
        )}
      </div>

      <div className="categories-scroll-row">
        {CATEGORIES_LIST.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          const imageUrl = getCategoryImage(cat.id);

          return (
            <div
              key={cat.id}
              className={`category-item-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectCategory(isSelected ? 'ALL' : cat.name)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCategory(isSelected ? 'ALL' : cat.name);
                }
              }}
              role="button"
              tabIndex={0}
              title={`Click to view all ${cat.name} food options`}
            >
              <div className="category-img-wrapper">
                <img
                  src={imageUrl}
                  alt={cat.name}
                  className="category-thumb-img"
                  onError={(e) => handleImageError(e, imageUrl)}
                  loading="lazy"
                />
                <span className="category-emoji-badge">{cat.icon}</span>
              </div>
              <span className="category-item-name">{cat.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
