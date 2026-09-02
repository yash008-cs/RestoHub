package com.restohub.controller;

import com.restohub.dto.request.ForgotPasswordRequest;
import com.restohub.dto.request.LoginRequest;
import com.restohub.dto.request.RegisterRequest;
import com.restohub.dto.request.ResetPasswordRequest;
import com.restohub.dto.request.VerifyOtpRequest;
import com.restohub.dto.response.ApiResponse;
import com.restohub.dto.response.AuthResponse;
import com.restohub.service.AuthService;
import com.restohub.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout() {
        AuthResponse response = authService.logout();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        ApiResponse response = passwordResetService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<ApiResponse> verifyResetOtp(@Valid @RequestBody VerifyOtpRequest request) {
        ApiResponse response = passwordResetService.verifyResetOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-reset-otp")
    public ResponseEntity<ApiResponse> resendResetOtp(@Valid @RequestBody ForgotPasswordRequest request) {
        ApiResponse response = passwordResetService.resendResetOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        ApiResponse response = passwordResetService.resetPassword(request);
        return ResponseEntity.ok(response);
    }
}
