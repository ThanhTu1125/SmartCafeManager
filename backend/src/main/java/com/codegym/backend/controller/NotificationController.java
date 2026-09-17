package com.codegym.backend.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.codegym.backend.service.NotificationService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Đăng ký (Subscribe) nhận thông báo theo thời gian thực (real-time) cho màn
     * hình Nhân viên hoặc Quản lý. API này sử dụng công nghệ Server-Sent Events
     * (SSE) với định dạng TEXT_EVENT_STREAM_VALUE. Client (giao diện của nhân
     * viên) sẽ gọi API này để mở và duy trì một kết nối liên tục một chiều từ
     * Server tới Client, giúp Server có thể chủ động đẩy (push) các thông báo
     * mới nhất xuống màn hình ngay lập tức mà không cần Client phải gửi yêu cầu
     * liên tục (polling).
     *
     * Đường dẫn API: GET http://localhost:8080/api/v1/auth/notification/subscribe
     */
    @GetMapping(value = "/api/v1/auth/notification/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        return notificationService.addEmitter();
    }

    /**
     * Gửi thông báo từ bàn ăn khi khách hàng có yêu cầu (ví dụ: "Gọi món" hoặc
     * "Gọi phục vụ"). Khi khách hàng nhấn nút trên thiết bị tại bàn, thiết bị sẽ
     * gọi API này, truyền lên tên bàn (tableName) và loại yêu cầu (actionType).
     * Server sẽ tạo một thông điệp (message) và phát (broadcast) thông điệp đó
     * tới tất cả các màn hình (emitters) của nhân viên đang lắng nghe ở luồng
     * API subscribe phía trên.
     *
     * (Đã cập nhật nhận @RequestBody bằng DTO để hỗ trợ test tiện lợi trên Swagger
     * UI)
     *
     * Đường dẫn API: POST http://localhost:8080/api/v1/auth/notification/send
     */
    @PostMapping("/api/v1/auth/notification/send")
    public ResponseEntity<String> sendNotification(@RequestBody NotificationDto request) {

        String message = "Bàn " + request.getTableName() + " vừa yêu cầu: [" + request.getActionType() + "]";
        notificationService.sendNotification(message);

        return ResponseEntity.ok("Đã gửi thông báo thành công!");
    }

    // --- Định nghĩa DTO trực tiếp tại đây để Swagger UI hiển thị form nhập dữ liệu
    // ---
    @Data
    public static class NotificationDto {
        private String tableName;
        private String actionType;
    }
}