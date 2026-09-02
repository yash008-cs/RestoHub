package com.restohub.service;

import com.restohub.dto.request.LoginRequest;
import com.restohub.dto.request.RegisterRequest;
import com.restohub.dto.response.AuthResponse;
import com.restohub.dto.response.CustomerResponse;
import com.restohub.entity.Customer;
import com.restohub.entity.Role;
import com.restohub.exception.DuplicateResourceException;
import com.restohub.exception.ResourceNotFoundException;
import com.restohub.repository.CustomerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final CustomerRepository customerRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(
            CustomerRepository customerRepository,
            BCryptPasswordEncoder passwordEncoder
    ) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Customer Registration API with BCrypt password hashing
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String cleanName = request.getName() != null ? request.getName().trim() : "";
        String rawPhone = request.getPhoneNumber();
        String rawPassword = request.getPassword();

        if (cleanName.isBlank() || rawPhone == null || rawPhone.isBlank() || rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("Please enter all required details.");
        }

        String cleanPhone = rawPhone.replaceAll("[^0-9]", "").trim();
        if (cleanPhone.length() > 10) {
            cleanPhone = cleanPhone.substring(cleanPhone.length() - 10);
        }
        if (cleanPhone.length() != 10) {
            throw new IllegalArgumentException("Please enter a valid mobile number.");
        }

        if (rawPassword.length() < 6) {
            throw new IllegalArgumentException("Password should contain at least 6 characters.");
        }

        // Check duplicate mobile number
        if (customerRepository.findByPhone(cleanPhone).isPresent()) {
            throw new DuplicateResourceException("This mobile number is already registered.");
        }

        // Hash password securely using BCrypt
        String hashedPassword = passwordEncoder.encode(rawPassword.trim());

        Customer customer = new Customer(null, cleanName, cleanPhone, hashedPassword);
        customer.setRole(Role.CUSTOMER);
        Customer savedCustomer = customerRepository.save(customer);

        log.info("Registered new customer successfully: id={}, phone={}", savedCustomer.getId(), savedCustomer.getPhone());

        CustomerResponse customerDto = new CustomerResponse(
                savedCustomer.getId(),
                savedCustomer.getName(),
                savedCustomer.getEmail(),
                savedCustomer.getPhone()
        );

        return new AuthResponse(true, "Account created successfully!", customerDto, "CUSTOMER", null);
    }

    /**
     * Customer Login API supporting both Email + Password and Phone Number + Password.
     */
    public AuthResponse login(LoginRequest request) {
        String rawIdentifier = request.getResolvedIdentifier();
        String rawPassword = request.getPassword();

        if (rawIdentifier == null || rawIdentifier.isBlank() || rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("Please enter your email/mobile number and password.");
        }

        String identifier = rawIdentifier.trim();
        Customer customer;

        if (identifier.contains("@")) {
            // Email validation
            if (!identifier.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
                throw new IllegalArgumentException("Please enter a valid email address.");
            }
            log.info("Attempting customer login for email: {}", identifier);
            customer = customerRepository.findByEmailIgnoreCase(identifier)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid email/phone number or password."));
        } else {
            // Phone validation
            String cleanPhone = identifier.replaceAll("[^0-9]", "").trim();
            if (cleanPhone.length() > 10) {
                cleanPhone = cleanPhone.substring(cleanPhone.length() - 10);
            }
            if (cleanPhone.length() != 10) {
                throw new IllegalArgumentException("Please enter a valid 10-digit mobile number or email.");
            }
            log.info("Attempting customer login for phone: {}", cleanPhone);
            customer = customerRepository.findByPhone(cleanPhone)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid email/phone number or password."));
        }

        // Verify password against BCrypt hash
        if (!passwordEncoder.matches(rawPassword.trim(), customer.getPassword())) {
            log.warn("Invalid password attempt for identifier: {}", identifier);
            throw new IllegalArgumentException("Invalid email/phone number or password.");
        }

        log.info("Customer logged in successfully: id={}, name={}", customer.getId(), customer.getName());

        CustomerResponse customerDto = new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                customer.getPhone()
        );

        String roleStr = customer.getRole() != null ? customer.getRole().name() : "CUSTOMER";
        return new AuthResponse(true, "Logged in successfully!", customerDto, roleStr, null);
    }

    /**
     * Customer Logout API
     */
    public AuthResponse logout() {
        return new AuthResponse(true, "Logged out successfully");
    }
}
