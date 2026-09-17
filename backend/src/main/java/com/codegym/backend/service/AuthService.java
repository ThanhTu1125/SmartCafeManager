package com.codegym.backend.service;

import java.security.SecureRandom;
import java.util.Date;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.codegym.backend.dto.ForgotPasswordRequest;
import com.codegym.backend.dto.LoginRequest;
import com.codegym.backend.dto.LoginResponse;
import com.codegym.backend.dto.ResetPasswordRequest;
import com.codegym.backend.dto.VerityOtpRequest;
import com.codegym.backend.entity.Account;
import com.codegym.backend.enums.AccountStatus;
import com.codegym.backend.exception.AppException;
import com.codegym.backend.repository.AccountRepository;
import com.codegym.backend.security.JwtTokenProvider;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final StringRedisTemplate redisTemplate;

    public LoginResponse login(LoginRequest request) {
        Account account = accountRepository.findByUsernameAndDeletedAtIsNull(request.getUsername())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Tài khoản không tồn tại hoặc đã bị xóa!"));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    "Tài khoản của bạn chưa được kích hoạt hoặc đang bị khóa!");
        }

        if (account.getRole() == null || account.getRole().getRoleName() == null) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Tài khoản chưa được phân quyền trên hệ thống");
        }
        String roleName = account.getRole().getRoleName();

        String userName = account.getUsername();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        long thirtyDaysInMillis = java.time.Duration.ofDays(30).toMillis();
        boolean requirePasswordChange = account.getPasswordChangedAt() == null ||
                (System.currentTimeMillis() - account.getPasswordChangedAt().getTime() > thirtyDaysInMillis);

        String token = jwtTokenProvider.generateToken(userDetails, requirePasswordChange);

        return new LoginResponse(token, "Đăng nhập thành công!", requirePasswordChange, roleName, userName);
    }

    @Transactional
    public String processForgotPassword(ForgotPasswordRequest request) {
        String neutralMessage = "Nếu email hợp lệ, hệ thống sẽ gửi mã OTP khôi phục mật khẩu đến email của bạn.";

        Account account = accountRepository.findByEmailAndDeletedAtIsNull(request.getEmail()).orElse(null);
        if (account == null || account.getStatus() != AccountStatus.ACTIVE) {
            return neutralMessage;
        }

        String email = account.getEmail();
        if (email == null || email.trim().isEmpty()) {
            return neutralMessage;
        }

        SecureRandom random = new SecureRandom();
        int otpValue = 100000 + random.nextInt(900000);
        String otp = String.valueOf(otpValue);

        redisTemplate.opsForValue().set("OTP_VAL:" + otp, email, 5, TimeUnit.MINUTES);

        emailService.sendPasswordResetMail(email, otp);

        return neutralMessage;
    }

    @Transactional
    public String verityOTP(VerityOtpRequest request) {
        String email = redisTemplate.opsForValue().get("OTP_VAL:" + request.getToken());
        if (email == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mã OTP không hợp lệ hoặc đã hết hạn!");
        }

        String resetTokenUuid = java.util.UUID.randomUUID().toString();

        redisTemplate.opsForValue().set("RESET_UUID:" + resetTokenUuid, email, 5, TimeUnit.MINUTES);

        redisTemplate.delete("OTP_VAL:" + request.getToken());

        return resetTokenUuid;
    }

    @Transactional
    public String processResetPassword(ResetPasswordRequest request) {
        String email = redisTemplate.opsForValue().get("RESET_UUID:" + request.getToken());
        if (email == null) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Mã xác nhận không hợp lệ hoặc đã hết hạn!");
        }
        Account account = accountRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Tài khoản không tồn tại hoặc đã bị xóa!"));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    "Tài khoản của bạn chưa được kích hoạt hoặc đang bị khóa!");
        }

        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        account.setPasswordChangedAt(new Date());
        accountRepository.save(account);
        redisTemplate.delete("RESET_UUID:" + request.getToken());

        return "Mật khẩu đã được đặt lại thành công!";
    }
}