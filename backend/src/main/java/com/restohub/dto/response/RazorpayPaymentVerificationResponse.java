package com.restohub.dto.response;

public class RazorpayPaymentVerificationResponse {

    private boolean verified;
    private String message;
    private String razorpayPaymentId;
    private String razorpayOrderId;
    private boolean alreadyProcessed;

    public RazorpayPaymentVerificationResponse() {}

    public RazorpayPaymentVerificationResponse(boolean verified, String message, String razorpayPaymentId, String razorpayOrderId) {
        this(verified, message, razorpayPaymentId, razorpayOrderId, false);
    }

    public RazorpayPaymentVerificationResponse(boolean verified, String message, String razorpayPaymentId, String razorpayOrderId, boolean alreadyProcessed) {
        this.verified = verified;
        this.message = message;
        this.razorpayPaymentId = razorpayPaymentId;
        this.razorpayOrderId = razorpayOrderId;
        this.alreadyProcessed = alreadyProcessed;
    }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public boolean isAlreadyProcessed() { return alreadyProcessed; }
    public void setAlreadyProcessed(boolean alreadyProcessed) { this.alreadyProcessed = alreadyProcessed; }
}
