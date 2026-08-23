package com.restohub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Please enter your full name.")
    private String name;

    @NotBlank(message = "Please enter your mobile number.")
    private String phoneNumber;

    @NotBlank(message = "Please enter your password.")
    @Size(min = 6, message = "Password should contain at least 6 characters.")
    private String password;

    private String role;

    public RegisterRequest() {}

    public RegisterRequest(String name, String phoneNumber, String password) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.password = password;
    }

    public RegisterRequest(String name, String phoneNumber, String password, String role) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.password = password;
        this.role = role;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
