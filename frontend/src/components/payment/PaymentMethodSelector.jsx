import React, { useState } from 'react';
import { CreditCard, Banknote } from 'lucide-react';
import { CodPayment } from './CodPayment';
import { CustomRazorpayPayment } from './CustomRazorpayPayment';

export const PaymentMethodSelector = ({
  payableAmount,
  onSelectPaymentOption,
  activeUser,
  selectedAddress,
  currentLocation,
  onPaymentSuccess,
  onPaymentError,
  restaurantAcceptingOrders,
}) => {
  const [activeTab, setActiveTab] = useState('razorpay'); // 'razorpay' (Pay Online) | 'cod' (Cash on Delivery)

  const handleSelectedDetails = (paymentMeta) => {
    onSelectPaymentOption(paymentMeta);
  };

  return (
    <div className="payment-method-container">
      {/* Left Sidebar Options - ONLY Pay Online and Cash on Delivery */}
      <div className="payment-sidebar-nav">
        <button
          className={`payment-nav-item ${activeTab === 'razorpay' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('razorpay');
            handleSelectedDetails({
              type: 'RAZORPAY',
              details: 'Pay Online',
            });
          }}
        >
          <CreditCard size={20} color="#ea580c" />
          <span>Pay Online</span>
        </button>

        <button
          className={`payment-nav-item ${activeTab === 'cod' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('cod');
            handleSelectedDetails({
              type: 'CASH_ON_DELIVERY',
              details: 'Cash on Delivery',
            });
          }}
        >
          <Banknote size={20} />
          <span>Cash on Delivery</span>
        </button>
      </div>

      {/* Right Content Panel */}
      <div className="payment-content-panel">
        {activeTab === 'razorpay' && (
          <CustomRazorpayPayment
            payableAmount={payableAmount}
            activeUser={activeUser}
            selectedAddress={selectedAddress}
            currentLocation={currentLocation}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
            restaurantAcceptingOrders={restaurantAcceptingOrders}
          />
        )}
        {activeTab === 'cod' && (
          <CodPayment payableAmount={payableAmount} onSelectPayment={handleSelectedDetails} />
        )}
      </div>
    </div>
  );
};
