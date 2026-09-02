package com.restohub.service;

import com.restohub.dto.request.ForgotPasswordRequest;
import com.restohub.dto.request.ResetPasswordRequest;
import com.restohub.dto.request.VerifyOtpRequest;
import com.restohub.dto.response.ApiResponse;
import com.restohub.entity.Customer;
import com.restohub.entity.PasswordResetOtp;
import com.restohub.exception.ResourceNotFoundException;
import com.restohub.repository.CustomerRepository;
import com.restohub.repository.PasswordResetOtpRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    private final CustomerRepository customerRepository;
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final EmailService emailService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${restohub.auth.otp.expiry-minutes:5}")
    private int otpExpiryMinutes;

    public PasswordResetService(
            CustomerRepository customerRepository,
            PasswordResetOtpRepository passwordResetOtpRepository,
            EmailService emailService,
            BCryptPasswordEncoder passwordEncoder
    ) {
        this.customerRepository = customerRepository;
        this.passwordResetOtpRepository = passwordResetOtpRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Step 1: Request 6-digit OTP for Forgot Password.
     */
    @Transactional
    public ApiResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        log.info("Processing forgot-password request for email: {}", email);

        Customer customer = customerRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email address '" + email + "'."));

        // Invalidate prior unconsumed OTPs for this customer
        invalidateExistingOtps(email);

        // Generate secure 6-digit OTP
        String otp = generateNumericOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(otpExpiryMinutes);

        PasswordResetOtp resetOtp = new PasswordResetOtp(customer, email, otp, expiresAt);
        passwordResetOtpRepository.save(resetOtp);

        // Send OTP via email
        emailService.sendPasswordResetOtp(email, otp, otpExpiryMinutes);

        return new ApiResponse(true, "Verification code sent to your registered email.");
    }

    /**
     * Step 2: Verify the 6-digit OTP.
     */
    @Transactional
    public ApiResponse verifyResetOtp(VerifyOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String inputOtp = request.getOtp().trim();
        log.info("Verifying password reset OTP for email: {}", email);

        // Verify customer existence
        customerRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email address '" + email + "'."));

        Optional<PasswordResetOtp> resetOpt = passwordResetOtpRepository
                .findTopByEmailIgnoreCaseAndConsumedFalseOrderByCreatedAtDesc(email);

        if (resetOpt.isEmpty()) {
            return new ApiResponse(false, "Invalid or expired verification code.");
        }

        PasswordResetOtp resetOtp = resetOpt.get();

        if (resetOtp.isExpired() || resetOtp.isConsumed()) {
            return new ApiResponse(false, "Invalid or expired verification code.");
        }

        if (resetOtp.isVerified()) {
            return new ApiResponse(true, "Email verified successfully.");
        }

        if (resetOtp.getAttempts() >= 5) {
            return new ApiResponse(false, "Maximum verification attempts exceeded. Please request a new verification code.");
        }

        if (!resetOtp.getOtp().equals(inputOtp)) {
            resetOtp.setAttempts(resetOtp.getAttempts() + 1);
            passwordResetOtpRepository.save(resetOtp);
            return new ApiResponse(false, "Invalid or expired verification code.");
        }

        resetOtp.setVerified(true);
        passwordResetOtpRepository.save(resetOtp);
        log.info("Successfully verified OTP for email: {}", email);

        return new ApiResponse(true, "Email verified successfully.");
    }

    /**
     * Resend OTP with 60-second rate-limiting cooldown.
     */
    @Transactional
    public ApiResponse resendResetOtp(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        log.info("Processing resend OTP request for email: {}", email);

        Customer customer = customerRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email address '" + email + "'."));

        // Check 60-second cooldown on latest OTP
        Optional<PasswordResetOtp> latestOpt = passwordResetOtpRepository
                .findTopByEmailIgnoreCaseAndConsumedFalseOrderByCreatedAtDesc(email);

        if (latestOpt.isPresent()) {
            PasswordResetOtp latest = latestOpt.get();
            if (latest.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(60))) {
                throw new IllegalArgumentException("Please wait at least 60 seconds before requesting a new code.");
            }
        }

        // Invalidate older OTPs
        invalidateExistingOtps(email);

        // Generate and dispatch new OTP
        String otp = generateNumericOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(otpExpiryMinutes);

        PasswordResetOtp resetOtp = new PasswordResetOtp(customer, email, otp, expiresAt);
        passwordResetOtpRepository.save(resetOtp);

        emailService.sendPasswordResetOtp(email, otp, otpExpiryMinutes);

        return new ApiResponse(true, "A new verification code has been sent to your registered email.");
    }

    /**
     * Step 3: Finalize password reset after successful OTP verification.
     */
    @Transactional
    public ApiResponse resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String newPassword = request.getNewPassword().trim();
        log.info("Attempting to finalize password reset for email: {}", email);

        Customer customer = customerRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email address '" + email + "'."));

        PasswordResetOtp resetOtp = passwordResetOtpRepository
                .findTopByEmailIgnoreCaseAndConsumedFalseOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new IllegalArgumentException("Please complete email OTP verification before resetting password."));

        if (!resetOtp.isVerified()) {
            throw new IllegalArgumentException("Email has not been verified yet. Please verify your OTP code first.");
        }

        if (resetOtp.getCreatedAt().isBefore(LocalDateTime.now().minusMinutes(15))) {
            throw new IllegalArgumentException("Verification session has expired. Please request a new verification code.");
        }

        // Hash new password securely with BCrypt
        customer.setPassword(passwordEncoder.encode(newPassword));
        customerRepository.save(customer);

        // Consume OTP record so it can never be reused
        resetOtp.setConsumed(true);
        passwordResetOtpRepository.save(resetOtp);

        log.info("Password successfully reset for customer id={}", customer.getId());
        return new ApiResponse(true, "Password reset successfully. You can now log in with your new password.");
    }

    private void invalidateExistingOtps(String email) {
        List<PasswordResetOtp> existing = passwordResetOtpRepository.findAllByEmailIgnoreCaseAndConsumedFalse(email);
        for (PasswordResetOtp otpRecord : existing) {
            otpRecord.setConsumed(true);
        }
        if (!existing.isEmpty()) {
            passwordResetOtpRepository.saveAll(existing);
        }
    }

    private String generateNumericOtp() {
        int code = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(code);
    }
}
