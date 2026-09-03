package com.restohub.service;

import com.restohub.dto.request.CustomerRequest;
import com.restohub.dto.request.LoginRequest;
import com.restohub.dto.request.PasswordResetRequest;
import com.restohub.dto.response.CustomerResponse;
import com.restohub.entity.Customer;
import com.restohub.exception.DuplicateResourceException;
import com.restohub.exception.ResourceNotFoundException;
import com.restohub.repository.CustomerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private static final Logger log = LoggerFactory.getLogger(CustomerService.class);

    private final CustomerRepository customerRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public CustomerService(CustomerRepository customerRepository,
                           BCryptPasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public CustomerResponse registerCustomer(CustomerRequest request) {
        String cleanPhone = request.getPhone() != null ? request.getPhone().trim() : "";
        String cleanPassword = request.getPassword().trim();
        String cleanName = request.getName().trim();

        log.info("Registering new customer with phone: {}", cleanPhone);

        if (customerRepository.findByPhone(cleanPhone).isPresent()) {
            throw new DuplicateResourceException("Account with phone '" + cleanPhone + "' already exists");
        }

        Customer customer = new Customer();
        customer.setName(cleanName);
        customer.setPhone(cleanPhone);
        String cleanEmail = request.getEmail() != null && !request.getEmail().isBlank()
                ? request.getEmail().trim().toLowerCase()
                : cleanPhone + "@restohub.app";
        customer.setEmail(cleanEmail);

        Customer savedCustomer = customerRepository.save(customer);
        log.info("Successfully registered customer in database: id={}, phone={}", savedCustomer.getId(), savedCustomer.getPhone());
        return mapToResponse(savedCustomer);
    }

    public CustomerResponse login(LoginRequest request) {
        String rawIdentifier = request.getResolvedIdentifier();
        String inputPassword = request.getPassword() != null ? request.getPassword().trim() : "";

        if (rawIdentifier == null || rawIdentifier.isBlank() || inputPassword.isBlank()) {
            throw new IllegalArgumentException("Please enter your email/mobile number and password.");
        }

        String identifier = rawIdentifier.trim();
        Customer customer;

        if (identifier.contains("@")) {
            if (!identifier.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
                throw new IllegalArgumentException("Please enter a valid email address.");
            }
            log.info("Attempting customer login for email: {}", identifier);
            customer = customerRepository.findByEmailIgnoreCase(identifier)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid email/phone number or password."));
        } else {
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

        if (!passwordEncoder.matches(inputPassword, customer.getPassword())) {
            log.warn("Failed login attempt for identifier: {} (password mismatch)", identifier);
            throw new IllegalArgumentException("Invalid email/phone number or password.");
        }

        log.info("Customer successfully authenticated: id={}, phone={}", customer.getId(), customer.getPhone());
        return mapToResponse(customer);
    }

    public List<CustomerResponse> getAllCustomers() {
        log.info("Fetching all customers from database");
        return customerRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CustomerResponse getCustomerById(Long id) {
        log.info("Fetching customer with id: {}", id);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        return mapToResponse(customer);
    }

    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        log.info("Updating customer with id: {}", id);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        customer.setName(request.getName().trim());
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            customer.setPhone(request.getPhone().trim());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            customer.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        }

        Customer updatedCustomer = customerRepository.save(customer);
        return mapToResponse(updatedCustomer);
    }

    public void deleteCustomer(Long id) {
        log.info("Deleting customer with id: {}", id);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        customerRepository.delete(customer);
    }

    public CustomerResponse resetPassword(PasswordResetRequest request) {
        String identifier = request.getEmailOrPhone().trim().toLowerCase();
        String newPassword = request.getNewPassword().trim();
        log.info("Attempting password reset for identifier: {}", identifier);

        Customer customer = customerRepository.findByPhone(identifier)
                .or(() -> customerRepository.findByEmailIgnoreCase(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("No customer account found: " + identifier));

        customer.setPassword(passwordEncoder.encode(newPassword));
        Customer updatedCustomer = customerRepository.save(customer);
        return mapToResponse(updatedCustomer);
    }

    private CustomerResponse mapToResponse(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                customer.getPhone()
        );
    }
}
