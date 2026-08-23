// Order Tracking Utilities for RestoHub Live Order Tracking System

export const getOrderTimestampMs = (order) => {
  if (!order) return Date.now();
  const placedTimeKey = `restohub_order_placed_time_${order.id}`;
  const storedTs = localStorage.getItem(placedTimeKey);
  if (storedTs && !isNaN(parseInt(storedTs, 10))) {
    return parseInt(storedTs, 10);
  }

  let parsedTs = Date.now();
  if (order.createdAt) {
    if (Array.isArray(order.createdAt)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = order.createdAt;
      parsedTs = new Date(year, month - 1, day, hour, minute, second).getTime();
    } else {
      const t = new Date(order.createdAt).getTime();
      if (!isNaN(t)) parsedTs = t;
    }
  }

  // If server time offset causes elapsed seconds to jump, store current placement time
  const diffSec = (Date.now() - parsedTs) / 1000;
  if (diffSec > 40 || diffSec < -10) {
    localStorage.setItem(placedTimeKey, Date.now().toString());
    return Date.now();
  }

  localStorage.setItem(placedTimeKey, String(parsedTs));
  return parsedTs;
};

export const PUNE_AREA_COORDINATES = {
  'baner': { lat: 18.5590, lng: 73.7868 },
  'sus': { lat: 18.5546, lng: 73.7479 },
  'balewadi': { lat: 18.5789, lng: 73.7707 },
  'wakad': { lat: 18.5987, lng: 73.7688 },
  'hinjewadi': { lat: 18.5912, lng: 73.7389 },
  'aundh': { lat: 18.5580, lng: 73.8077 },
  'kothrud': { lat: 18.5074, lng: 73.8077 },
  'shivajinagar': { lat: 18.5314, lng: 73.8446 },
  'koregaon park': { lat: 18.5362, lng: 73.8940 },
  'kalyani nagar': { lat: 18.5463, lng: 73.9033 },
  'viman nagar': { lat: 18.5679, lng: 73.9143 },
  'kharadi': { lat: 18.5515, lng: 73.9448 },
  'hadapsar': { lat: 18.5089, lng: 73.9260 },
  'magarpatta': { lat: 18.5158, lng: 73.9272 },
  'pimple saudagar': { lat: 18.5987, lng: 73.7997 },
};

export const extractAreaName = (str) => {
  if (!str) return 'baner';
  const lower = str.toLowerCase();
  for (const area of Object.keys(PUNE_AREA_COORDINATES)) {
    if (lower.includes(area)) return area;
  }
  return 'baner';
};

export const calculatePuneDistanceKm = (customerArea, restaurantLocation) => {
  const cArea = extractAreaName(customerArea);
  const rArea = extractAreaName(restaurantLocation);

  const coord1 = PUNE_AREA_COORDINATES[cArea] || PUNE_AREA_COORDINATES['baner'];
  const coord2 = PUNE_AREA_COORDINATES[rArea] || PUNE_AREA_COORDINATES['baner'];

  const R = 6371; // Earth radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;

  return Math.max(1.2, Math.round(straightKm * 1.35 * 10) / 10);
};

export const calculateEstimatedTimings = (order, userArea = 'Sus') => {
  const restaurantName = (order ? (order.restaurantName || '') : '').toLowerCase();
  const restaurantAddress = order ? (order.restaurantAddress || order.address || order.location || '') : '';

  let totalMinutes = 20;
  if (restaurantName.includes('royal masala tales') || String(order?.restaurantId) === '112') {
    totalMinutes = 6; // 360 seconds fast testing
  } else {
    const distanceKm = calculatePuneDistanceKm(userArea, restaurantAddress || restaurantName);
    totalMinutes = Math.min(30, Math.max(15, Math.round(distanceKm * 2.5)));
  }

  const distanceKm = calculatePuneDistanceKm(userArea, restaurantAddress || restaurantName);
  const totalSeconds = totalMinutes * 60;

  // Exact time ratio: 0% Placed, 40% Kitchen Prep, 20% Assigning Partner, 40% Delivery
  const prepSeconds = Math.round(totalSeconds * 0.40);
  const assignSeconds = Math.round(totalSeconds * 0.20);
  const deliverySeconds = totalSeconds - prepSeconds - assignSeconds;

  const assignStartSeconds = prepSeconds;
  const deliveryStartSeconds = prepSeconds + assignSeconds;

  return {
    distanceKm,
    totalMinutes,
    totalSeconds,
    prepSeconds,
    assignSeconds,
    deliverySeconds,
    assignStartSeconds,
    deliveryStartSeconds,
  };
};

export const getOrderTrackingInfo = (ord, nowMs = Date.now(), userArea = 'Sus') => {
  if (!ord) return null;
  const orderCreatedMs = getOrderTimestampMs(ord);
  const elapsedSeconds = Math.max(0, Math.floor((nowMs - orderCreatedMs) / 1000));
  const timings = calculateEstimatedTimings(ord, userArea);
  const remainingDeliverySeconds = Math.max(0, timings.totalSeconds - elapsedSeconds);

  let stage = 'PLACED'; // PLACED | PREPARING | ASSIGNING_PARTNER | OUT_FOR_DELIVERY | DELIVERED
  if (elapsedSeconds >= timings.totalSeconds) {
    stage = 'DELIVERED';
  } else if (elapsedSeconds >= timings.deliveryStartSeconds) {
    stage = 'OUT_FOR_DELIVERY';
  } else if (elapsedSeconds >= timings.assignStartSeconds) {
    stage = 'ASSIGNING_PARTNER';
  } else if (elapsedSeconds >= 4) {
    stage = 'PREPARING';
  } else {
    stage = 'PLACED';
  }

  const delMinutes = Math.floor(remainingDeliverySeconds / 60);
  const delSeconds = remainingDeliverySeconds % 60;
  const liveTimerFormatted = `${String(delMinutes).padStart(2, '0')}:${String(delSeconds).padStart(2, '0')}`;

  let line1FillPct = 0;
  let line2FillPct = 0;
  let line3FillPct = 0;

  if (elapsedSeconds >= timings.totalSeconds) {
    line1FillPct = 100;
    line2FillPct = 100;
    line3FillPct = 100;
  } else if (elapsedSeconds >= timings.deliveryStartSeconds) {
    line1FillPct = 100;
    line2FillPct = 100;
    const deliveryElapsed = elapsedSeconds - timings.deliveryStartSeconds;
    line3FillPct = Math.min(100, Math.max(0, (deliveryElapsed / timings.deliverySeconds) * 100));
  } else if (elapsedSeconds >= timings.assignStartSeconds) {
    line1FillPct = 100;
    const assignElapsed = elapsedSeconds - timings.assignStartSeconds;
    line2FillPct = Math.min(100, Math.max(0, (assignElapsed / timings.assignSeconds) * 100));
    line3FillPct = 0;
  } else {
    line1FillPct = Math.min(100, Math.max(0, (elapsedSeconds / timings.prepSeconds) * 100));
    line2FillPct = 0;
    line3FillPct = 0;
  }

  return {
    stage,
    elapsedSeconds,
    remainingDeliverySeconds,
    liveTimerFormatted,
    timings,
    isDelivered: stage === 'DELIVERED',
    line1FillPct,
    line2FillPct,
    line3FillPct,
  };
};

export const getStatusDisplayMeta = (stage) => {
  switch (stage) {
    case 'ORDER_PLACED':
    case 'PLACED':
      return {
        title: 'Order placed successfully',
        subtext: 'The restaurant has received your order.',
        icon: '✓',
      };
    case 'PREPARING':
      return {
        title: 'Your food is being prepared',
        subtext: 'Chef is cooking your meal in the kitchen.',
        icon: 'CHEF',
      };
    case 'ASSIGNING_PARTNER':
      return {
        title: 'Finding a delivery partner for you',
        subtext: 'Assigning nearest RestoHub delivery agent.',
        icon: 'PARTNER',
      };
    case 'OUT_FOR_DELIVERY':
      return {
        title: 'Your order is on the way',
        subtext: 'Delivery partner is heading to your address.',
        icon: 'DELIVERY',
      };
    case 'DELIVERED':
      return {
        title: '✓ Delivered successfully',
        subtext: 'Thank you for ordering with RestoHub! Enjoy your meal!',
        icon: '✓',
      };
    default:
      return {
        title: 'Processing your order',
        subtext: 'Live tracking active...',
        icon: '⏱',
      };
  }
};
