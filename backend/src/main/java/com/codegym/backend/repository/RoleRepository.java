package com.codegym.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.codegym.backend.entity.Role;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByRoleName(String roleName);
}