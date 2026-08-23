package com.restohub.entity;

public enum RestaurantStatus {
    PENDING_REVIEW,
    ACTIVE,
    CLOSED,
    REJECTED,
    // Legacy support
    PENDING,
    APPROVED
}
