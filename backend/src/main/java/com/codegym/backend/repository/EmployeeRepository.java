package com.codegym.backend.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.codegym.backend.entity.Account;
import com.codegym.backend.entity.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByAccount(Account account);

    boolean existsByPhoneNumberAndAccountNot(String phoneNumber, Account account);
}