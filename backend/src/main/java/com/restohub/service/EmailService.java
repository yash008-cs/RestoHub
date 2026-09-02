package com.restohub.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:restohub.app@gmail.com}")
    private String fromEmail;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends a 6-digit OTP verification code with sender name "RestoHub".
     *
     * @param toEmail The destination email address
     * @param otp The 6-digit numeric OTP code
     * @param expiryMinutes The validity period of the OTP in minutes
     */
    public void sendPasswordResetOtp(String toEmail, String otp, int expiryMinutes) {
        log.info("Sending password reset verification OTP to: {}", toEmail);

        if (mailSender == null) {
            log.warn("JavaMailSender bean is not active. Fallback OTP simulated for testing: {} -> {}", toEmail, otp);
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            // Display name set to "RestoHub" so the sender shows as "RestoHub" in inbox
            helper.setFrom(fromEmail, "RestoHub");
            helper.setTo(toEmail);
            helper.setSubject("RestoHub — Password Reset Verification Code");

            String plainText = "Hello,\n\n"
                    + "We received a request to reset your password for your RestoHub account.\n\n"
                    + "Your 6-digit verification code is:\n\n"
                    + "      " + otp + "\n\n"
                    + "This code is valid for " + expiryMinutes + " minutes and can only be used once.\n\n"
                    + "If you did not request a password reset, you can safely ignore this email.\n\n"
                    + "Warm regards,\n"
                    + "The RestoHub Team";

            String htmlContent = "<div style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);\">"
                    + "<div style=\"background: linear-gradient(135deg, #fc8019 0%, #ea580c 100%); padding: 24px; text-align: center;\">"
                    + "<h1 style=\"color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;\">RestoHub</h1>"
                    + "<p style=\"color: #ffedd5; margin: 4px 0 0 0; font-size: 13px;\">Delicious Food, Delivered Fast</p>"
                    + "</div>"
                    + "<div style=\"padding: 32px 28px;\">"
                    + "<h2 style=\"color: #0f172a; margin: 0 0 12px 0; font-size: 20px; font-weight: 700;\">Password Reset Verification</h2>"
                    + "<p style=\"color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;\">"
                    + "Hello,<br>We received a request to reset your password for your RestoHub account. Use the 6-digit verification code below to proceed:"
                    + "</p>"
                    + "<div style=\"background: #fff7ed; border: 1.5px dashed #ea580c; border-radius: 12px; padding: 18px; text-align: center; margin: 0 0 24px 0;\">"
                    + "<span style=\"font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #ea580c; font-family: monospace;\">" + otp + "</span>"
                    + "<div style=\"color: #9a3412; font-size: 12px; font-weight: 600; margin-top: 8px;\">Valid for " + expiryMinutes + " minutes • Single-use only</div>"
                    + "</div>"
                    + "<p style=\"color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 24px 0;\">"
                    + "If you did not request this code, you can safely ignore this email. Your password will remain unchanged."
                    + "</p>"
                    + "<hr style=\"border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px 0;\" />"
                    + "<p style=\"color: #94a3b8; font-size: 12px; margin: 0; text-align: center;\">&copy; 2026 RestoHub. All rights reserved.</p>"
                    + "</div>"
                    + "</div>";

            helper.setText(plainText, htmlContent);

            mailSender.send(mimeMessage);
            log.info("Successfully dispatched branded password reset email from RestoHub to: {}", toEmail);
        } catch (Exception ex) {
            log.warn("SMTP email delivery encountered an issue for {} ({}). Fallback OTP logged for dev/testing: {}",
                    toEmail, ex.getMessage(), otp);
        }
    }
}
