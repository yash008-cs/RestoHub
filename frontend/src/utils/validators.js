export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePhone = (phone) => {
  const cleanPhone = String(phone).replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 12;
};

export const validateUpiId = (upiId) => {
  const re = /^[\w.-]+@[\w.-]+$/;
  return re.test(String(upiId).trim());
};

export const validateCardNumber = (cardNumber) => {
  const cleanNum = String(cardNumber).replace(/\s+/g, '');
  return /^\d{16}$/.test(cleanNum);
};

export const validateCardExpiry = (expiry) => {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
  const [mm, yy] = expiry.split('/').map(Number);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const currentYear = Number(String(now.getFullYear()).slice(2));
  const currentMonth = now.getMonth() + 1;
  if (yy < currentYear) return false;
  if (yy === currentYear && mm < currentMonth) return false;
  return true;
};

export const validateCvv = (cvv) => {
  return /^\d{3,4}$/.test(String(cvv).trim());
};
