package com.restohub.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.restohub.config.RazorpayConfig;
import com.restohub.dto.request.RazorpayOrderRequest;
import com.restohub.dto.request.RazorpayPaymentVerificationRequest;
import com.restohub.dto.response.RazorpayOrderResponse;
import com.restohub.dto.response.RazorpayPaymentVerificationResponse;
import com.restohub.dto.response.RazorpayWebhookResponse;
import com.restohub.entity.OrderStatus;
import com.restohub.entity.PaymentRecord;
import com.restohub.exception.ResourceNotFoundException;
import com.restohub.repository.OrderRepository;
import com.restohub.repository.PaymentRecordRepository;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;
import java.util.UUID;

@Service
public class RazorpayService {

    private static final Logger log = LoggerFactory.getLogger(RazorpayService.class);

    private final RazorpayClient razorpayClient;
    private final RazorpayConfig razorpayConfig;
    private final PaymentRecordRepository paymentRecordRepository;
    private final OrderRepository orderRepository;

    public RazorpayService(
            RazorpayClient razorpayClient,
            RazorpayConfig razorpayConfig,
            PaymentRecordRepository paymentRecordRepository,
            OrderRepository orderRepository
    ) {
        this.razorpayClient = razorpayClient;
        this.razorpayConfig = razorpayConfig;
        this.paymentRecordRepository = paymentRecordRepository;
        this.orderRepository = orderRepository;
    }

    public RazorpayOrderResponse createRazorpayOrder(RazorpayOrderRequest request) {
        if (razorpayClient == null || !razorpayConfig.isConfigured()) {
            throw new IllegalArgumentException("Razorpay Test Mode credentials are not configured on server.");
        }

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Order amount must be greater than zero.");
        }

        // Convert amount to paise (1 INR = 100 paise)
        BigDecimal amountInPaiseBD = request.getAmount().multiply(new BigDecimal("100")).setScale(0, RoundingMode.HALF_UP);
        long amountInPaise = amountInPaiseBD.longValue();

        String receipt = request.getReceipt();
        if (receipt == null || receipt.isBlank()) {
            receipt = "rcpt_" + UUID.randomUUID().toString().substring(0, 8);
        }

        try {
            JSONObject razorpayReq = new JSONObject();
            razorpayReq.put("amount", amountInPaise);
            razorpayReq.put("currency", request.getCurrency() != null ? request.getCurrency() : "INR");
            razorpayReq.put("receipt", receipt);

            JSONObject notes = new JSONObject();
            if (request.getRestoHubOrderId() != null) {
                notes.put("restoHubOrderId", request.getRestoHubOrderId());
            }
            if (request.getCustomerId() != null) {
                notes.put("customerId", request.getCustomerId());
            }
            if (request.getRestaurantId() != null) {
                notes.put("restaurantId", request.getRestaurantId());
            }
            if (notes.length() > 0) {
                razorpayReq.put("notes", notes);
            }

            log.info("Creating Razorpay Test Mode order for amount: ₹{} ({} paise)", request.getAmount(), amountInPaise);
            Order order = razorpayClient.orders.create(razorpayReq);

            String orderId = order.get("id");
            String status = order.get("status");

            log.info("Successfully created Razorpay Order ID: {}", orderId);

            return new RazorpayOrderResponse(
                    orderId,
                    request.getAmount(),
                    amountInPaise,
                    request.getCurrency() != null ? request.getCurrency() : "INR",
                    razorpayConfig.getKeyId(),
                    status,
                    receipt
            );
        } catch (RazorpayException e) {
            log.error("Razorpay Order Creation Failed: {}", e.getMessage(), e);
            throw new IllegalArgumentException("Failed to create Razorpay Order: " + e.getMessage(), e);
        }
    }

    /**
     * Step 5, 6 & 7: Verifies signature, checks idempotency, and performs ATOMIC DATABASE TRANSACTION.
     */
    @Transactional
    public RazorpayPaymentVerificationResponse verifyPaymentSignature(RazorpayPaymentVerificationRequest request) {
        if (!razorpayConfig.isConfigured()) {
            throw new IllegalArgumentException("Razorpay credentials are not configured on server.");
        }

        String paymentId = request.getRazorpayPaymentId();
        String orderId = request.getRazorpayOrderId();
        String receivedSignature = request.getRazorpaySignature();
        Long restoHubOrderId = request.getRestoHubOrderId();

        if (paymentId == null || paymentId.isBlank() ||
            orderId == null || orderId.isBlank() ||
            receivedSignature == null || receivedSignature.isBlank()) {
            return new RazorpayPaymentVerificationResponse(
                    false,
                    "Payment signature verification failed: Missing required parameters.",
                    paymentId,
                    orderId,
                    false
            );
        }

        // STEP 5: Cryptographic Signature Verification
        boolean isValidSignature = checkHmacSignature(orderId, paymentId, receivedSignature);
        if (!isValidSignature) {
            log.warn("Razorpay Payment Signature Verification FAILED for Order ID: {}, Payment ID: {}", orderId, paymentId);
            return new RazorpayPaymentVerificationResponse(
                    false,
                    "Payment signature verification failed. Invalid signature.",
                    paymentId,
                    orderId,
                    false
            );
        }

        // STEP 6: Idempotency Check
        Optional<PaymentRecord> existingRecord = paymentRecordRepository.findByRazorpayPaymentId(paymentId);
        if (existingRecord.isPresent()) {
            log.info("IDEMPOTENCY TRIGGERED: Payment ID {} has already been verified and processed.", paymentId);
            return new RazorpayPaymentVerificationResponse(
                    true,
                    "Payment signature already verified and processed.",
                    paymentId,
                    orderId,
                    true
            );
        }

        // STEP 7: Atomic Transaction (Payment Record + RestoHub Order Update)
        try {
            PaymentRecord paymentRecord = new PaymentRecord(paymentId, orderId, receivedSignature, "VERIFIED", restoHubOrderId);
            paymentRecordRepository.save(paymentRecord);

            if (restoHubOrderId != null) {
                log.info("Updating RestoHub Order ID {} status to CONFIRMED inside active transaction", restoHubOrderId);
                com.restohub.entity.Order restoHubOrder = orderRepository.findById(restoHubOrderId)
                        .orElseThrow(() -> new ResourceNotFoundException("RestoHub Order not found with id: " + restoHubOrderId));
                restoHubOrder.setStatus(OrderStatus.CONFIRMED);
                orderRepository.save(restoHubOrder);
            }

            paymentRecordRepository.flush();

            log.info("TRANSACTION COMMITTED: Razorpay Payment & RestoHub Order atomically updated for Order ID: {}, Payment ID: {}", orderId, paymentId);
            return new RazorpayPaymentVerificationResponse(
                    true,
                    "Payment signature verified successfully.",
                    paymentId,
                    orderId,
                    false
            );
        } catch (DataIntegrityViolationException e) {
            log.info("CONCURRENCY IDEMPOTENCY: Duplicate insert intercepted by database unique constraint for Payment ID: {}", paymentId);
            return new RazorpayPaymentVerificationResponse(
                    true,
                    "Payment signature already verified and processed.",
                    paymentId,
                    orderId,
                    true
            );
        }
    }

    /**
     * STEP 8: Razorpay Webhook Integration with RAW Body HMAC-SHA256 Signature Verification,
     * Database Idempotency, and Atomic Transaction Processing.
     */
    @Transactional
    public synchronized RazorpayWebhookResponse processRazorpayWebhook(String rawPayload, String signatureHeader) {
        if (signatureHeader == null || signatureHeader.isBlank()) {
            log.warn("Razorpay Webhook rejected: Missing X-Razorpay-Signature header");
            return new RazorpayWebhookResponse(false, "Missing X-Razorpay-Signature header", null, null, null, false);
        }

        if (!razorpayConfig.isWebhookConfigured()) {
            log.error("Razorpay Webhook Secret is not configured in backend environment.");
            throw new IllegalArgumentException("Razorpay Webhook Secret is not configured in backend environment.");
        }

        String webhookSecret = razorpayConfig.getWebhookSecret();

        // 1. Cryptographic HMAC-SHA256 signature verification against RAW payload string
        boolean isValidSignature = checkWebhookHmacSignature(rawPayload, signatureHeader, webhookSecret);
        if (!isValidSignature) {
            log.warn("Razorpay Webhook signature verification FAILED for header: {}", signatureHeader);
            return new RazorpayWebhookResponse(false, "Invalid Webhook Signature", null, null, null, false);
        }

        // 2. Parse JSON Event Payload
        JSONObject json = new JSONObject(rawPayload);
        String event = json.optString("event");

        JSONObject payloadObj = json.optJSONObject("payload");
        JSONObject paymentObj = payloadObj != null ? payloadObj.optJSONObject("payment") : null;
        JSONObject paymentEntity = paymentObj != null ? paymentObj.optJSONObject("entity") : null;

        if (paymentEntity == null) {
            log.warn("Razorpay Webhook payload missing payment entity for event: {}", event);
            return new RazorpayWebhookResponse(true, "Event ignored: missing payment entity", event, null, null, false);
        }

        String paymentId = paymentEntity.optString("id");
        String razorpayOrderId = paymentEntity.optString("order_id");
        String paymentStatus = paymentEntity.optString("status");

        Long restoHubOrderId = null;
        JSONObject notesObj = paymentEntity.optJSONObject("notes");
        if (notesObj != null && notesObj.has("restoHubOrderId")) {
            try {
                restoHubOrderId = notesObj.getLong("restoHubOrderId");
            } catch (Exception e) {
                try {
                    restoHubOrderId = Long.parseLong(notesObj.getString("restoHubOrderId"));
                } catch (Exception ignored) {}
            }
        }

        // 3. Step 6 Idempotency & State-Transition Check
        Optional<PaymentRecord> existingRecordOpt = paymentRecordRepository.findByRazorpayPaymentId(paymentId);
        if (existingRecordOpt.isPresent()) {
            PaymentRecord existingRecord = existingRecordOpt.get();
            // Handle valid state transition: FAILED -> CAPTURED
            if ("FAILED".equalsIgnoreCase(existingRecord.getStatus()) && "payment.captured".equals(event)) {
                log.info("WEBHOOK STATE TRANSITION: Payment ID {} updated from FAILED to CAPTURED", paymentId);
                existingRecord.setStatus("CAPTURED");

                Long targetOrderId = restoHubOrderId != null ? restoHubOrderId : existingRecord.getRestoHubOrderId();
                if (targetOrderId != null) {
                    final Long finalOrderId = targetOrderId;
                    log.info("WEBHOOK: Updating RestoHub Order ID {} status to CONFIRMED for state-transitioned payment {}", finalOrderId, paymentId);
                    com.restohub.entity.Order restoHubOrder = orderRepository.findById(finalOrderId)
                            .orElseThrow(() -> new ResourceNotFoundException("RestoHub Order not found with id: " + finalOrderId));
                    restoHubOrder.setStatus(OrderStatus.CONFIRMED);
                    orderRepository.save(restoHubOrder);
                }

                paymentRecordRepository.save(existingRecord);
                paymentRecordRepository.flush();
                return new RazorpayWebhookResponse(true, "Payment state updated from FAILED to CAPTURED.", event, paymentId, razorpayOrderId, false);
            }

            log.info("WEBHOOK IDEMPOTENCY TRIGGERED: Payment ID {} has already been processed for event {}", paymentId, event);
            return new RazorpayWebhookResponse(true, "Webhook event already processed.", event, paymentId, razorpayOrderId, true);
        }

        // 4. Step 7 Atomic Transaction Processing
        try {
            String recordStatus = "payment.captured".equals(event) ? "CAPTURED" : ("payment.failed".equals(event) ? "FAILED" : paymentStatus.toUpperCase());
            PaymentRecord paymentRecord = new PaymentRecord(paymentId, razorpayOrderId, signatureHeader, recordStatus, restoHubOrderId);
            paymentRecordRepository.save(paymentRecord);

            if ("payment.captured".equals(event)) {
                if (restoHubOrderId != null) {
                    final Long targetOrderId = restoHubOrderId;
                    log.info("WEBHOOK: Updating RestoHub Order ID {} status to CONFIRMED for captured payment {}", targetOrderId, paymentId);
                    com.restohub.entity.Order restoHubOrder = orderRepository.findById(targetOrderId)
                            .orElseThrow(() -> new ResourceNotFoundException("RestoHub Order not found with id: " + targetOrderId));
                    restoHubOrder.setStatus(OrderStatus.CONFIRMED);
                    orderRepository.save(restoHubOrder);
                }
            } else if ("payment.failed".equals(event)) {
                if (restoHubOrderId != null) {
                    log.info("WEBHOOK: Payment failed for RestoHub Order ID {}. Order remains un-confirmed.", restoHubOrderId);
                }
            }

            paymentRecordRepository.flush();

            log.info("WEBHOOK TRANSACTION COMMITTED: Event {} processed for Payment ID: {}", event, paymentId);
            return new RazorpayWebhookResponse(true, "Webhook processed successfully.", event, paymentId, razorpayOrderId, false);

        } catch (DataIntegrityViolationException e) {
            log.info("WEBHOOK CONCURRENCY IDEMPOTENCY: Duplicate insert intercepted by database unique constraint for Payment ID: {}", paymentId);
            return new RazorpayWebhookResponse(true, "Webhook event already processed.", event, paymentId, razorpayOrderId, true);
        }
    }

    private boolean checkHmacSignature(String orderId, String paymentId, String receivedSignature) {
        try {
            String secret = razorpayConfig.getKeySecret().trim();
            String payload = orderId + "|" + paymentId;

            String generatedSignature = calculateHmacSha256(payload, secret);

            byte[] a = generatedSignature.getBytes(StandardCharsets.UTF_8);
            byte[] b = receivedSignature.getBytes(StandardCharsets.UTF_8);

            return MessageDigest.isEqual(a, b);
        } catch (Exception e) {
            log.error("Error during HMAC-SHA256 signature verification for Order ID: {}", orderId, e);
            return false;
        }
    }

    private boolean checkWebhookHmacSignature(String rawPayload, String receivedSignature, String webhookSecret) {
        try {
            String generatedSignature = calculateHmacSha256(rawPayload, webhookSecret.trim());
            byte[] a = generatedSignature.getBytes(StandardCharsets.UTF_8);
            byte[] b = receivedSignature.getBytes(StandardCharsets.UTF_8);
            return MessageDigest.isEqual(a, b);
        } catch (Exception e) {
            log.error("Error during webhook HMAC-SHA256 signature verification", e);
            return false;
        }
    }

    private String calculateHmacSha256(String data, String secret) throws Exception {
        Mac sha256Hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256Hmac.init(secretKey);
        byte[] hash = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));

        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
