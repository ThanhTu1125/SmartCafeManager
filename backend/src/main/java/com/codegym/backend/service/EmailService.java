package com.codegym.backend.service;

import java.nio.charset.StandardCharsets;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.codegym.backend.exception.AppException;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @SuppressWarnings("null")
    public void sendPasswordResetMail(String to, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            ClassPathResource resource = new ClassPathResource("/templates/otp-template.html");
            String htmltemplate = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

            String htmlContent = String.format(htmltemplate, token);

            helper.setTo(to);
            helper.setSubject("Yêu cầu khôi phục mật khẩu - Smart Cafe");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Đã gửi email OTP HTML thành công đến: {}", to);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email HTML OTP: ", e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Không thể gửi email OTP, vui lòng thử lại sau!");
        }
    }
}