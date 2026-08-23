package com.restohub.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class RazorpayOrderRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.00", message = "Amount must be at least ₹1.00")
    private BigDecimal amount;

    private String currency = "INR";
    private String receipt;
    private Long customerId;
    private Long restaurantId;
    private Long restoHubOrderId;

    public RazorpayOrderRequest() {}

    public RazorpayOrderRequest(BigDecimal amount, String currency, String receipt) {
        this.amount = amount;
        this.currency = currency != null ? currency : "INR";
        this.receipt = receipt;
    }

    public RazorpayOrderRequest(BigDecimal amount, String currency, String receipt, Long restoHubOrderId) {
        this.amount = amount;
        this.currency = currency != null ? currency : "INR";
        this.receipt = receipt;
        this.restoHubOrderId = restoHubOrderId;
    }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getReceipt() { return receipt; }
    public void setReceipt(String receipt) { this.receipt = receipt; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Long getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }

    public Long getRestoHubOrderId() { return restoHubOrderId; }
    public void setRestoHubOrderId(Long restoHubOrderId) { this.restoHubOrderId = restoHubOrderId; }
}
