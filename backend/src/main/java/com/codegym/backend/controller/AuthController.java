package com.codegym.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.codegym.backend.dto.ForgotPasswordRequest;
import com.codegym.backend.dto.LoginRequest;
import com.codegym.backend.dto.ResetPasswordRequest;
import com.codegym.backend.dto.VerityOtpRequest;
import com.codegym.backend.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Xử lý yêu cầu đăng nhập của người dùng.
     * Nhận vào thông tin tài khoản (username) và mật khẩu (password). Nếu xác
     * thực thành công, hệ thống sẽ trả về một chuỗi JWT (Json Web Token) cùng
     * với các thông tin cơ bản (vai trò, tên người dùng, trạng thái có cần đổi
     * mật khẩu hay không).
     *
     * Yêu cầu phân quyền: Công khai, không yêu cầu đăng nhập (permitAll()) —
     * để bất kỳ ai cũng có thể gọi chức năng đăng nhập.
     *
     * Đường dẫn API: POST http://localhost:8080/api/v1/auth/login
     */
    @PostMapping("/login")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Yêu cầu gửi mã OTP để khôi phục mật khẩu (Quên mật khẩu).
     * Người dùng cung cấp địa chỉ email đã đăng ký. Hệ thống sẽ kiểm tra xem
     * email có tồn tại và đang hoạt động hay không. Nếu hợp lệ, một mã OTP/Token
     * sẽ được tạo ra và gửi đến email đó (thường có hiệu lực trong khoảng thời
     * gian ngắn, ví dụ 5 phút).
     *
     * Yêu cầu phân quyền: Công khai, không yêu cầu đăng nhập (permitAll()).
     *
     * Đường dẫn API: POST http://localhost:8080/api/v1/auth/forgot-password
     */
    @PostMapping("/forgot-password")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.processForgotPassword(request));
    }

    /**
     * Thiết lập lại mật khẩu mới sử dụng mã khôi phục (OTP/Token).
     * Người dùng gửi lên mã xác nhận (đã nhận được từ email) cùng với mật khẩu
     * mới mong muốn. Hệ thống sẽ kiểm tra tính hợp lệ và thời hạn của mã OTP.
     * Nếu mọi thứ chính xác, mật khẩu mới sẽ được mã hóa và cập nhật vào cơ sở
     * dữ liệu.
     *
     * Yêu cầu phân quyền: Công khai, không yêu cầu đăng nhập (permitAll()).
     *
     * Đường dẫn API: POST http://localhost:8080/api/v1/auth/reset-password
     */
    @PostMapping("/reset-password")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.processResetPassword(request));
    }

    /**
     * Xác thực mã OTP và cấp Reset Token (UUID)
     */
    @PreAuthorize("permitAll()")
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@Valid @RequestBody VerityOtpRequest request) {
        String message = authService.verityOTP(request);
        return ResponseEntity.ok(java.util.Map.of("resetToken", message));
    }
}