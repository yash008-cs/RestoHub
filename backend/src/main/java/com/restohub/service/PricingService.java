package com.restohub.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

@Service
public class PricingService {

    // Approximate Pune Locality Coordinates (Latitude, Longitude) for distance calculation
    private static final Map<String, double[]> PUNE_LOCALITY_COORDINATES = new HashMap<>();

    static {
        PUNE_LOCALITY_COORDINATES.put("baner", new double[]{18.5590, 73.7868});
        PUNE_LOCALITY_COORDINATES.put("sus", new double[]{18.5546, 73.7479});
        PUNE_LOCALITY_COORDINATES.put("balewadi", new double[]{18.5789, 73.7707});
        PUNE_LOCALITY_COORDINATES.put("wakad", new double[]{18.5987, 73.7688});
        PUNE_LOCALITY_COORDINATES.put("hinjawadi", new double[]{18.5912, 73.7389});
        PUNE_LOCALITY_COORDINATES.put("hinjewadi", new double[]{18.5912, 73.7389});
        PUNE_LOCALITY_COORDINATES.put("aundh", new double[]{18.5580, 73.8077});
        PUNE_LOCALITY_COORDINATES.put("kothrud", new double[]{18.5074, 73.8077});
        PUNE_LOCALITY_COORDINATES.put("deccan", new double[]{18.5167, 73.8417});
        PUNE_LOCALITY_COORDINATES.put("shivajinagar", new double[]{18.5314, 73.8446});
        PUNE_LOCALITY_COORDINATES.put("koregaon park", new double[]{18.5362, 73.8940});
        PUNE_LOCALITY_COORDINATES.put("kalyani nagar", new double[]{18.5463, 73.9033});
        PUNE_LOCALITY_COORDINATES.put("viman nagar", new double[]{18.5679, 73.9143});
        PUNE_LOCALITY_COORDINATES.put("kharadi", new double[]{18.5515, 73.9448});
        PUNE_LOCALITY_COORDINATES.put("hadapsar", new double[]{18.5089, 73.9260});
        PUNE_LOCALITY_COORDINATES.put("magarpatta", new double[]{18.5158, 73.9272});
        PUNE_LOCALITY_COORDINATES.put("pimple saudagar", new double[]{18.5987, 73.7997});
        PUNE_LOCALITY_COORDINATES.put("pimpri", new double[]{18.6298, 73.7997});
        PUNE_LOCALITY_COORDINATES.put("chinchwad", new double[]{18.6278, 73.8131});
        PUNE_LOCALITY_COORDINATES.put("camp", new double[]{18.5144, 73.8785});
        PUNE_LOCALITY_COORDINATES.put("katraj", new double[]{18.4575, 73.8508});
        PUNE_LOCALITY_COORDINATES.put("kondhwa", new double[]{18.4695, 73.8931});
        PUNE_LOCALITY_COORDINATES.put("swargate", new double[]{18.5018, 73.8636});
        PUNE_LOCALITY_COORDINATES.put("sinhagad road", new double[]{18.4735, 73.8242});
    }

    /**
     * Calculates Pune road distance in km between customer locality and restaurant locality.
     */
    public double calculateDistanceKm(String customerLocality, String restaurantLocality) {
        String cArea = extractAreaName(customerLocality);
        String rArea = extractAreaName(restaurantLocality);

        double[] coord1 = PUNE_LOCALITY_COORDINATES.getOrDefault(cArea, PUNE_LOCALITY_COORDINATES.get("baner"));
        double[] coord2 = PUNE_LOCALITY_COORDINATES.getOrDefault(rArea, PUNE_LOCALITY_COORDINATES.get("baner"));

        double r = 6371; // Earth's radius in km
        double dLat = Math.toRadians(coord2[0] - coord1[0]);
        double dLng = Math.toRadians(coord2[1] - coord1[1]);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(coord1[0])) * Math.cos(Math.toRadians(coord2[0])) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double straightKm = r * c;

        // Real road factor for Pune city traffic (~1.35x straight line distance)
        double distance = straightKm * 1.35;
        if (distance < 1.2 && !cArea.equalsIgnoreCase(rArea)) {
            distance = 1.2;
        }
        return Math.round(distance * 10.0) / 10.0;
    }

    /**
     * RULE: Delivery charges are ONLY applicable if distance between restaurant and customer is > 7.5 km.
     * Distance <= 7.5 km: ₹0 (FREE)
     * Distance > 7.5 km and <= 10 km: ₹50
     * Distance > 10 km and <= 15 km: ₹100
     * Distance > 15 km and <= 20 km: ₹150
     * Distance > 20 km: ₹200 (capped at ₹200)
     */
    public BigDecimal calculateBaseDeliveryCharge(BigDecimal subtotal) {
        return BigDecimal.ZERO;
    }

    public BigDecimal calculateDistanceCharge(double distanceKm) {
        if (distanceKm <= 7.5) {
            return BigDecimal.ZERO;
        } else if (distanceKm <= 10.0) {
            return new BigDecimal("50.00");
        } else if (distanceKm <= 15.0) {
            return new BigDecimal("100.00");
        } else if (distanceKm <= 20.0) {
            return new BigDecimal("150.00");
        } else {
            return new BigDecimal("200.00");
        }
    }

    /**
     * Calculates Taxes & Other Charges (5% GST + ₹25 Restaurant Packaging & Handling Fee).
     */
    public BigDecimal calculateTaxes(BigDecimal subtotal) {
        if (subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal gst = subtotal.multiply(new BigDecimal("0.05")).setScale(0, RoundingMode.HALF_UP);
        BigDecimal packagingAndPlatformFee = new BigDecimal("25.00");
        return gst.add(packagingAndPlatformFee);
    }

    private String extractAreaName(String text) {
        if (text == null) return "baner";
        String lower = text.toLowerCase();
        for (String area : PUNE_LOCALITY_COORDINATES.keySet()) {
            if (lower.contains(area)) return area;
        }
        return "baner";
    }
}
