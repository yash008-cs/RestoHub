// Approximate Pune Locality Coordinates for Distance Calculation
const PUNE_LOCALITY_COORDINATES = {
  'baner': { lat: 18.5590, lng: 73.7868 },
  'sus': { lat: 18.5546, lng: 73.7479 },
  'balewadi': { lat: 18.5789, lng: 73.7707 },
  'wakad': { lat: 18.5987, lng: 73.7688 },
  'hinjawadi': { lat: 18.5912, lng: 73.7389 },
  'hinjewadi': { lat: 18.5912, lng: 73.7389 },
  'aundh': { lat: 18.5580, lng: 73.8077 },
  'kothrud': { lat: 18.5074, lng: 73.8077 },
  'deccan': { lat: 18.5167, lng: 73.8417 },
  'shivajinagar': { lat: 18.5314, lng: 73.8446 },
  'koregaon park': { lat: 18.5362, lng: 73.8940 },
  'kalyani nagar': { lat: 18.5463, lng: 73.9033 },
  'viman nagar': { lat: 18.5679, lng: 73.9143 },
  'kharadi': { lat: 18.5515, lng: 73.9448 },
  'hadapsar': { lat: 18.5089, lng: 73.9260 },
  'magarpatta': { lat: 18.5158, lng: 73.9272 },
  'pimple saudagar': { lat: 18.5987, lng: 73.7997 },
  'pimpri': { lat: 18.6298, lng: 73.7997 },
  'chinchwad': { lat: 18.6278, lng: 73.8131 },
  'camp': { lat: 18.5144, lng: 73.8785 },
  'katraj': { lat: 18.4575, lng: 73.8508 },
  'kondhwa': { lat: 18.4695, lng: 73.8931 },
  'swargate': { lat: 18.5018, lng: 73.8636 },
  'sinhagad road': { lat: 18.4735, lng: 73.8242 },
};

const extractAreaName = (text) => {
  if (!text) return 'baner';
  const lower = text.toLowerCase();
  for (const area of Object.keys(PUNE_LOCALITY_COORDINATES)) {
    if (lower.includes(area)) return area;
  }
  return 'baner';
};

/**
 * Calculates Pune road distance in km between customer locality and restaurant location.
 */
export const calculateDistanceKm = (customerLocality, restaurantLocation) => {
  const cArea = extractAreaName(customerLocality);
  const rArea = extractAreaName(restaurantLocation);

  const coord1 = PUNE_LOCALITY_COORDINATES[cArea] || PUNE_LOCALITY_COORDINATES['baner'];
  const coord2 = PUNE_LOCALITY_COORDINATES[rArea] || PUNE_LOCALITY_COORDINATES['baner'];

  const r = 6371; // Earth's radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = r * c;

  let distance = straightKm * 1.35; // Real Pune road multiplier (~1.35x)
  if (distance < 1.2 && cArea !== rArea) {
    distance = 1.2;
  }
  return Math.max(1.2, Math.round(distance * 10) / 10);
};

/**
 * RULE: Delivery charges apply ONLY if distance between restaurant and customer is > 7.5 km.
 * Distance <= 7.5 km: ₹0 (FREE)
 * Distance > 7.5 km and <= 10 km: ₹50
 * Distance > 10 km and <= 15 km: ₹100
 * Distance > 15 km and <= 20 km: ₹150
 * Distance > 20 km: ₹200
 */
export const calculateBaseDeliveryCharge = (subtotal) => {
  return 0;
};

export const calculateDistanceCharge = (distanceKm) => {
  if (!distanceKm || distanceKm <= 7.5) {
    return 0;
  } else if (distanceKm <= 10.0) {
    return 50;
  } else if (distanceKm <= 15.0) {
    return 100;
  } else if (distanceKm <= 20.0) {
    return 150;
  } else {
    return 200;
  }
};

/**
 * Calculates GST & Other Charges (5% GST + ₹25 Packaging & Platform Fee).
 */
export const calculateTaxes = (subtotal) => {
  if (!subtotal || subtotal <= 0) return 0;
  const gst = Math.round(subtotal * 0.05);
  const packagingFee = 25;
  return gst + packagingFee;
};

/**
 * Complete transparent pricing breakdown calculation.
 */
export const calculateCartBreakdown = (cartItems, restaurant, customerLocality = 'Sus') => {
  const subtotal = (cartItems || []).reduce((acc, item) => {
    const price = Number(item.food?.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + price * qty;
  }, 0);

  if (subtotal === 0) {
    return {
      subtotal: 0,
      baseDeliveryCharge: 0,
      isFreeBaseDelivery: true,
      distanceKm: 0,
      distanceCharge: 0,
      taxes: 0,
      finalTotal: 0,
    };
  }

  const baseDeliveryCharge = 0;
  const restaurantLocation = restaurant?.address || restaurant?.locality || restaurant?.name || 'Baner';
  const distanceKm = calculateDistanceKm(customerLocality, restaurantLocation);
  const distanceCharge = calculateDistanceCharge(distanceKm);
  const isFreeBaseDelivery = distanceCharge === 0;

  const taxes = calculateTaxes(subtotal);
  const finalTotal = subtotal + distanceCharge + taxes;

  return {
    subtotal,
    baseDeliveryCharge: 0,
    isFreeBaseDelivery,
    distanceKm,
    distanceCharge,
    taxes,
    finalTotal,
  };
};
