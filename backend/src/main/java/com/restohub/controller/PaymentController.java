package com.restohub.controller;

import com.restohub.dto.request.RazorpayOrderRequest;
import com.restohub.dto.request.RazorpayPaymentVerificationRequest;
import com.restohub.dto.response.RazorpayOrderResponse;
import com.restohub.dto.response.RazorpayPaymentVerificationResponse;
import com.restohub.dto.response.RazorpayWebhookResponse;
import com.restohub.service.RazorpayService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.UnexpectedRollbackException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final RazorpayService razorpayService;

    public PaymentController(RazorpayService razorpayService) {
        this.razorpayService = razorpayService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<RazorpayOrderResponse> createRazorpayOrder(@Valid @RequestBody RazorpayOrderRequest request) {
        RazorpayOrderResponse response = razorpayService.createRazorpayOrder(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/verify")
    public ResponseEntity<RazorpayPaymentVerificationResponse> verifyPaymentSignature(
            @Valid @RequestBody RazorpayPaymentVerificationRequest request
    ) {
        try {
            RazorpayPaymentVerificationResponse response = razorpayService.verifyPaymentSignature(request);
            if (response.isVerified()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (DataIntegrityViolationException | UnexpectedRollbackException ex) {
            log.info("CONCURRENCY IDEMPOTENCY: Caught concurrent duplicate insertion in PaymentController for payment ID: {}", request.getRazorpayPaymentId());
            RazorpayPaymentVerificationResponse response = new RazorpayPaymentVerificationResponse(
                    true,
                    "Payment signature already verified and processed.",
                    request.getRazorpayPaymentId(),
                    request.getRazorpayOrderId(),
                    true
            );
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<RazorpayWebhookResponse> handleRazorpayWebhook(
            @RequestBody String rawPayload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signatureHeader
    ) {
        try {
            RazorpayWebhookResponse response = razorpayService.processRazorpayWebhook(rawPayload, signatureHeader);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (DataIntegrityViolationException | UnexpectedRollbackException ex) {
            log.info("CONCURRENCY IDEMPOTENCY: Caught concurrent duplicate webhook insertion in PaymentController");
            RazorpayWebhookResponse response = new RazorpayWebhookResponse(
                    true,
                    "Webhook event already processed.",
                    "unknown",
                    null,
                    null,
                    true
            );
            return ResponseEntity.ok(response);
        }
    }
}
