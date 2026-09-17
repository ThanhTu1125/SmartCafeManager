package com.codegym.backend.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.codegym.backend.entity.Account;
@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByUsernameAndDeletedAtIsNull(String username);

    Optional<Account> findByEmailAndDeletedAtIsNull(String email);

    Optional<Account> findByResetTokenAndDeletedAtIsNull(String resetToken);
}