package com.restohub.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Login Request DTO supporting both Phone Number and Email Login.
 * Backward compatible with existing clients sending 'phoneNumber'.
 */
public class LoginRequest {

    private String identifier;
    private String phoneNumber;
    private String email;

    @NotBlank(message = "Please enter your password.")
    private String password;

    public LoginRequest() {}

    public LoginRequest(String identifier, String password) {
        this.identifier = identifier;
        this.phoneNumber = identifier;
        this.password = password;
    }

    /**
     * Resolves the primary identifier from 'identifier', 'phoneNumber', or 'email'.
     */
    public String getResolvedIdentifier() {
        if (identifier != null && !identifier.isBlank()) {
            return identifier.trim();
        }
        if (phoneNumber != null && !phoneNumber.isBlank()) {
            return phoneNumber.trim();
        }
        if (email != null && !email.isBlank()) {
            return email.trim();
        }
        return null;
    }

    public String getIdentifier() {
        return identifier != null ? identifier : getResolvedIdentifier();
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getPhoneNumber() {
        return phoneNumber != null ? phoneNumber : identifier;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
