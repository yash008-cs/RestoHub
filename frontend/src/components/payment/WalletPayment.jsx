import React, { useState } from 'react';
import { POPULAR_WALLETS } from '../../constants/wallets';
import { CheckCircle2 } from 'lucide-react';

export const WalletPayment = ({ onSelectPayment }) => {
  const [selectedWallet, setSelectedWallet] = useState(POPULAR_WALLETS[0].id);

  const handleChoose = (wallet) => {
    setSelectedWallet(wallet.id);
    onSelectPayment({
      type: 'WALLET',
      details: `${wallet.name}`,
    });
  };

  return (
    <div className="payment-sub-card">
      <h3 className="payment-section-title">Select Wallet</h3>

      <div className="wallets-grid">
        {POPULAR_WALLETS.map((w) => {
          const isSelected = selectedWallet === w.id;
          return (
            <div
              key={w.id}
              className={`wallet-card-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handleChoose(w)}
            >
              <div className="wallet-icon-box">{w.icon}</div>
              <div className="wallet-meta">
                <span className="wallet-title">{w.name}</span>
                <span className="wallet-desc">{w.description}</span>
              </div>
              {isSelected && <CheckCircle2 size={20} className="wallet-check-icon" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
