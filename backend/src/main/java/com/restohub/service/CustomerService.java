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
        customer.setPassword(passwordEncoder.encode(cleanPassword));
        customer.setEmail(cleanPhone + "@restohub.app");

        Customer savedCustomer = customerRepository.save(customer);
        log.info("Successfully registered customer in database: id={}, phone={}", savedCustomer.getId(), savedCustomer.getPhone());
        return mapToResponse(savedCustomer);
    }

    public CustomerResponse login(LoginRequest request) {
        String phone = request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : "";
        String inputPassword = request.getPassword().trim();
        log.info("Attempting customer login for phone: {}", phone);

        Customer customer = customerRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with mobile number '" + phone + "'. Please create an account."));

        if (!passwordEncoder.matches(inputPassword, customer.getPassword())) {
            log.warn("Failed login attempt for phone: {} (password mismatch)", phone);
            throw new IllegalArgumentException("Invalid mobile number or password.");
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
