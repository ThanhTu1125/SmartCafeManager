package com.codegym.backend.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.codegym.backend.entity.Account;
import com.codegym.backend.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByAccount(Account account);
    Optional<Customer> findByAccountUsername(String username);
    boolean existsByPhoneNumberAndAccountNot(String phoneNumber, Account account);
}