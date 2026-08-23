package com.restohub.dto.response;

public class RazorpayWebhookResponse {

    private boolean success;
    private String message;
    private String event;
    private String razorpayPaymentId;
    private String razorpayOrderId;
    private boolean alreadyProcessed;

    public RazorpayWebhookResponse() {}

    public RazorpayWebhookResponse(boolean success, String message, String event, String razorpayPaymentId, String razorpayOrderId, boolean alreadyProcessed) {
        this.success = success;
        this.message = message;
        this.event = event;
        this.razorpayPaymentId = razorpayPaymentId;
        this.razorpayOrderId = razorpayOrderId;
        this.alreadyProcessed = alreadyProcessed;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getEvent() { return event; }
    public void setEvent(String event) { this.event = event; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public boolean isAlreadyProcessed() { return alreadyProcessed; }
    public void setAlreadyProcessed(boolean alreadyProcessed) { this.alreadyProcessed = alreadyProcessed; }
}
