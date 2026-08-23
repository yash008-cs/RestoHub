package com.restohub.dto.response;

public class AuthResponse {

    private boolean success;
    private String message;
    private CustomerResponse customer;
    private String role;
    private Long restaurantId;

    public AuthResponse() {}

    public AuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public AuthResponse(boolean success, String message, CustomerResponse customer) {
        this.success = success;
        this.message = message;
        this.customer = customer;
        this.role = "CUSTOMER";
    }

    public AuthResponse(boolean success, String message, CustomerResponse customer, String role, Long restaurantId) {
        this.success = success;
        this.message = message;
        this.customer = customer;
        this.role = role;
        this.restaurantId = restaurantId;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public CustomerResponse getCustomer() { return customer; }
    public void setCustomer(CustomerResponse customer) { this.customer = customer; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Long getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }
}
