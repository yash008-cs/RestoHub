import React, { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { validateCardNumber, validateCardExpiry, validateCvv } from '../../utils/validators';

export const AddCardPayment = ({ onSelectPayment }) => {
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    nickname: '',
    secureCard: true,
  });

  const [touched, setTouched] = useState({});

  const handleCardNumberChange = (e) => {
    // Format input with spaces every 4 digits
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardData({ ...cardData, number: formatted });
  };

  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardData({ ...cardData, expiry: raw });
  };

  const isNumValid = validateCardNumber(cardData.number);
  const isExpValid = validateCardExpiry(cardData.expiry);
  const isCvvValid = validateCvv(cardData.cvv);
  const isNameValid = cardData.name.trim().length >= 3;

  const isFormValid = isNumValid && isExpValid && isCvvValid && isNameValid;

  const handleProceed = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    // Mask card number for display safely: e.g. **** **** **** 4321
    const cleanNum = cardData.number.replace(/\s+/g, '');
    const masked = `**** **** **** ${cleanNum.slice(-4)}`;

    onSelectPayment({
      type: 'CARD',
      details: `Credit/Debit Card (${masked})`,
      cardNickname: cardData.nickname || 'Saved Card',
    });
  };

  return (
    <div className="payment-sub-card">
      <div className="card-header-flex">
        <h3 className="payment-section-title">Add New Card</h3>
      </div>

      <form onSubmit={handleProceed} className="add-card-form">
        {/* Card Number */}
        <div className="form-group-field">
          <label>Card Number *</label>
          <div className="input-with-icon">
            <CreditCard size={18} className="field-icon" />
            <input
              type="text"
              placeholder="4532 1234 5678 9012"
              value={cardData.number}
              onChange={handleCardNumberChange}
              onBlur={() => setTouched({ ...touched, number: true })}
              maxLength={19}
              className={`card-input ${touched.number && !isNumValid ? 'invalid' : ''}`}
            />
          </div>
        </div>

        {/* Expiry & CVV */}
        <div className="form-grid-2col">
          <div className="form-group-field">
            <label>Valid Through (MM/YY) *</label>
            <input
              type="text"
              placeholder="08/28"
              value={cardData.expiry}
              onChange={handleExpiryChange}
              onBlur={() => setTouched({ ...touched, expiry: true })}
              maxLength={5}
              className={`card-input ${touched.expiry && !isExpValid ? 'invalid' : ''}`}
            />
          </div>

          <div className="form-group-field">
            <label>CVV *</label>
            <div className="input-with-icon">
              <Lock size={16} className="field-icon" />
              <input
                type="password"
                placeholder="123"
                value={cardData.cvv}
                onChange={(e) =>
                  setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })
                }
                onBlur={() => setTouched({ ...touched, cvv: true })}
                maxLength={4}
                className={`card-input ${touched.cvv && !isCvvValid ? 'invalid' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Name on Card & Nickname */}
        <div className="form-grid-2col">
          <div className="form-group-field">
            <label>Name on Card *</label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={cardData.name}
              onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
              className="card-input"
            />
          </div>

          <div className="form-group-field">
            <label>Card Nickname (Optional)</label>
            <input
              type="text"
              placeholder="e.g. HDFC Salary Card"
              value={cardData.nickname}
              onChange={(e) => setCardData({ ...cardData, nickname: e.target.value })}
              className="card-input"
            />
          </div>
        </div>

        {/* Secure Card Checkbox */}
        <div className="checkbox-row">
          <input
            type="checkbox"
            id="secureCard"
            checked={cardData.secureCard}
            onChange={(e) => setCardData({ ...cardData, secureCard: e.target.checked })}
          />
          <label htmlFor="secureCard">Secure this card as per RBI guidelines (Demo Mode)</label>
        </div>

        {/* Proceed Button */}
        <button
          type="submit"
          className="card-proceed-btn"
          disabled={!isFormValid}
        >
          PROCEED & SAVE CARD
        </button>
      </form>
    </div>
  );
};
