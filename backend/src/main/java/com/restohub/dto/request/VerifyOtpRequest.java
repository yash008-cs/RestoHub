package com.restohub.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class VerifyOtpRequest {

    @NotBlank(message = "Please enter your registered email address.")
    @Email(message = "Please enter a valid email address.")
    private String email;

    @NotBlank(message = "Please enter the 6-digit verification code.")
    @Pattern(regexp = "^\\d{6}$", message = "Verification code must be exactly 6 digits.")
    private String otp;

    public VerifyOtpRequest() {}

    public VerifyOtpRequest(String email, String otp) {
        this.email = email;
        this.otp = otp;
    }

    public String getEmail() {
        return email != null ? email.trim() : null;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtp() {
        return otp != null ? otp.trim() : null;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}
