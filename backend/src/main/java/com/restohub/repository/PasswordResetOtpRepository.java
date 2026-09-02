package com.restohub.repository;

import com.restohub.entity.Customer;
import com.restohub.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {

    Optional<PasswordResetOtp> findTopByEmailIgnoreCaseAndConsumedFalseOrderByCreatedAtDesc(String email);

    List<PasswordResetOtp> findAllByEmailIgnoreCaseAndConsumedFalse(String email);

    List<PasswordResetOtp> findAllByCustomer(Customer customer);

    void deleteAllByCustomer(Customer customer);
}
