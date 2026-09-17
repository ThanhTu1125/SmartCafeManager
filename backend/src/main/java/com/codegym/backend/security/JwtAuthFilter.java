package com.codegym.backend.security;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.codegym.backend.entity.Account;
import com.codegym.backend.enums.AccountStatus;
import com.codegym.backend.repository.AccountRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final AccountRepository accountRepository;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String username = jwtTokenProvider.extractUsername(token);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    if (!jwtTokenProvider.isTokenExpired(token)) {

                        Account account = accountRepository.findByUsernameAndDeletedAtIsNull(username).orElse(null);
                        if (account == null || account.getStatus() != AccountStatus.ACTIVE) {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json; charset=UTF-8");
                            response.getWriter().write(
                                    "{\"error\": \"Tài khoản không tồn tại, đang bị khóa hoặc đã bị xóa!\"}");
                            return;
                        }

                        boolean requirePasswordChange = jwtTokenProvider.extractRequirePasswordChange(token);
                        String requestedUrl = request.getRequestURI();

                        if (requirePasswordChange && !requestedUrl.equals("/api/v1/users/change-password")
                                && !requestedUrl.startsWith("/api/v1/auth/logout")) {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json; charset=UTF-8");
                            response.getWriter().write(
                                    "{\"error\": \"Mật khẩu của bạn đã quá hạn 30 ngày. Vui lòng đổi mật khẩu để tiếp tục sử dụng hệ thống!\"}");
                            return;
                        }

                        List<String> roles = jwtTokenProvider.extractRoles(token);

                        log.info("==> [JWT Auth] Tài khoản: {} | Quyền hạn giải mã từ Token: {}", username, roles);

                        List<SimpleGrantedAuthority> authorities = roles.stream()
                                .flatMap(role -> java.util.stream.Stream.of(
                                        new SimpleGrantedAuthority(role.trim()),
                                        new SimpleGrantedAuthority("ROLE_" + role.trim().toUpperCase())))
                                .collect(Collectors.toList());

                        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                                username, null, authorities);
                        authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                    }
                }
            } catch (Exception e) {
                log.error("==> [JWT Auth] Lỗi giải mã Token: {}", e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}