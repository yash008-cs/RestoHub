import api from './api';

export const paymentService = {
  /**
   * Calls backend POST /api/payments/create-order with amount in RUPEES.
   * Backend converts to paise internally for Razorpay API.
   */
  createRazorpayOrder: async (amount, currency = 'INR', receipt = null, restoHubOrderId = null) => {
    const response = await api.post('/api/payments/create-order', {
      amount: Number(amount),
      currency: currency,
      receipt: receipt,
      restoHubOrderId: restoHubOrderId ? Number(restoHubOrderId) : null,
    });
    return response.data;
  },

  /**
   * Calls backend POST /api/payments/verify for HMAC-SHA256 signature verification.
   */
  verifyPaymentSignature: async ({ razorpayPaymentId, razorpayOrderId, razorpaySignature, restoHubOrderId }) => {
    const response = await api.post('/api/payments/verify', {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      restoHubOrderId: restoHubOrderId ? Number(restoHubOrderId) : null,
    });
    return response.data;
  },

  /**
   * Dynamically loads official Razorpay Checkout script (https://checkout.razorpay.com/v1/checkout.js) into browser DOM.
   */
  loadRazorpayCustomScript: () => {
    return new Promise((resolve) => {
      // Check if an old invalid script tag (razorpay.js) is in DOM
      const badScript = document.querySelector('script[src*="v1/razorpay.js"]');
      if (badScript) {
        badScript.remove();
        delete window.Razorpay;
      }

      if (window.Razorpay && typeof window.Razorpay === 'function') {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  /**
   * Backwards compatible script loader
   */
  loadRazorpayScript: () => {
    return paymentService.loadRazorpayCustomScript();
  },
};
