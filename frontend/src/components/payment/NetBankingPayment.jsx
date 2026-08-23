import React, { useState } from 'react';
import { POPULAR_BANKS, ALL_BANKS } from '../../constants/banks';
import { CheckCircle2 } from 'lucide-react';

export const NetBankingPayment = ({ onSelectPayment }) => {
  const [selectedBank, setSelectedBank] = useState(POPULAR_BANKS[0].id);

  const handleSelectBank = (bank) => {
    setSelectedBank(bank.id);
    onSelectPayment({
      type: 'NET_BANKING',
      details: `Net Banking - ${bank.name}`,
    });
  };

  const handleSelectFromDropdown = (e) => {
    const bankId = e.target.value;
    const found = ALL_BANKS.find((b) => b.id === bankId);
    if (found) {
      handleSelectBank(found);
    }
  };

  return (
    <div className="payment-sub-card">
      <h3 className="payment-section-title">Internet Banking</h3>

      <h4 className="payment-sub-title">Popular Banks</h4>
      <div className="popular-banks-grid">
        {POPULAR_BANKS.map((b) => {
          const isSelected = selectedBank === b.id;
          return (
            <button
              type="button"
              key={b.id}
              className={`bank-tile-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelectBank(b)}
            >
              <span className="bank-logo-emo">{b.logo}</span>
              <span className="bank-tile-name">{b.name}</span>
              {isSelected && <CheckCircle2 size={16} className="bank-check" />}
            </button>
          );
        })}
      </div>

      <div className="all-banks-group">
        <label className="all-banks-label">Other Banks</label>
        <select
          className="all-banks-select"
          value={selectedBank}
          onChange={handleSelectFromDropdown}
        >
          <option value="" disabled>
            -- Select Bank --
          </option>
          {ALL_BANKS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
