package com.restohub.dto.request;

import jakarta.validation.constraints.NotBlank;

public class RazorpayPaymentVerificationRequest {

    @NotBlank(message = "Razorpay Payment ID is required")
    private String razorpayPaymentId;

    @NotBlank(message = "Razorpay Order ID is required")
    private String razorpayOrderId;

    @NotBlank(message = "Razorpay Signature is required")
    private String razorpaySignature;

    private Long restoHubOrderId;

    public RazorpayPaymentVerificationRequest() {}

    public RazorpayPaymentVerificationRequest(String razorpayPaymentId, String razorpayOrderId, String razorpaySignature) {
        this.razorpayPaymentId = razorpayPaymentId;
        this.razorpayOrderId = razorpayOrderId;
        this.razorpaySignature = razorpaySignature;
    }

    public RazorpayPaymentVerificationRequest(String razorpayPaymentId, String razorpayOrderId, String razorpaySignature, Long restoHubOrderId) {
        this.razorpayPaymentId = razorpayPaymentId;
        this.razorpayOrderId = razorpayOrderId;
        this.razorpaySignature = razorpaySignature;
        this.restoHubOrderId = restoHubOrderId;
    }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpaySignature() { return razorpaySignature; }
    public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }

    public Long getRestoHubOrderId() { return restoHubOrderId; }
    public void setRestoHubOrderId(Long restoHubOrderId) { this.restoHubOrderId = restoHubOrderId; }
}
