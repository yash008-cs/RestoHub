export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDate = (dateInput) => {
  if (!dateInput) return 'Today';
  try {
    let date;
    if (Array.isArray(dateInput)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput;
      date = new Date(year, month - 1, day, hour, minute, second);
    } else {
      date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) return 'Recently';

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return 'Recently';
  }
};

export const formatAddress = (addr) => {
  if (!addr) return 'Pune, Maharashtra';
  if (typeof addr === 'string') return addr;
  const parts = [addr.flatNo, addr.apartment, addr.landmark, addr.area, addr.city]
    .filter(Boolean);
  return parts.join(', ');
};
