package com.codegym.backend.service;

import java.util.Collections;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.codegym.backend.entity.Account;
import com.codegym.backend.enums.AccountStatus;
import com.codegym.backend.repository.AccountRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImpUserDetailsService implements UserDetailsService {
        private final AccountRepository accountRepository;

        @Override
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
                Account account = accountRepository.findByUsernameAndDeletedAtIsNull(username)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                                "Không tìm thấy người dùng với tên đăng nhập: " + username));

                String roleName = (account.getRole() != null && account.getRole().getRoleName() != null)
                                ? account.getRole().getRoleName()
                                : "USER";

                boolean enabled = account.getStatus() == AccountStatus.ACTIVE;

                return new User(
                                account.getUsername(),
                                account.getPassword(),
                                enabled,
                                true,
                                true,
                                enabled,
                                Collections.singletonList(
                                                new SimpleGrantedAuthority(roleName.toUpperCase())));
        }
}