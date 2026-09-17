package com.codegym.backend.controller;

import com.codegym.backend.dto.FeedbackRequestDTO;
import com.codegym.backend.dto.FeedbackResponseDTO;
import com.codegym.backend.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin("*")
@RequiredArgsConstructor
@Slf4j
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final SimpMessagingTemplate messagingTemplate; // 🟢 Bổ sung WebSocket Template

    /**
     * Khách hàng gửi đánh giá mới
     * URL: POST /api/v1/customer/feedbacks
     */
    @PostMapping(value = "/customer/feedbacks", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createFeedback(
            @RequestParam(required = false) String content,
            @RequestParam Integer rating,
            @RequestParam Long orderId,
            @RequestParam(required = false) String senderName,
            @RequestParam(required = false) String email,
            @RequestParam Long itemId,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile,
            Authentication authentication
    ) {
        // Gom dữ liệu vào DTO
        FeedbackRequestDTO dto = FeedbackRequestDTO.builder()
                .content(content)
                .rating(rating)
                .orderId(orderId)
                .senderName(senderName)
                .email(email)
                .itemId(itemId)
                .imageFile(imageFile)
                .build();

        String finalEmail;

        // Xử lý Email người gửi
        if (authentication != null && authentication.isAuthenticated() 
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            finalEmail = (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) 
                    ? dto.getEmail().trim() 
                    : authentication.getName();
        } else {
            if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Khách vãng lai bắt buộc phải nhập email!"));
            }
            finalEmail = dto.getEmail().trim();
        }

        dto.setEmail(finalEmail);

        FeedbackResponseDTO createdFeedback = feedbackService.createFeedback(dto);

        notifyNewFeedback(createdFeedback);

        return ResponseEntity.ok(createdFeedback);
    }

    @GetMapping("/customer/feedbacks/item/{itemId}")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbacksByItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(feedbackService.getFeedbacksByItem(itemId));
    }

    @GetMapping("/staff/feedbacks")
    public ResponseEntity<List<FeedbackResponseDTO>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks());
    }

    @DeleteMapping("/staff/feedbacks/{feedbackId}")
    public ResponseEntity<Map<String, String>> deleteFeedback(@PathVariable Long feedbackId) {
        feedbackService.deleteFeedback(feedbackId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa đánh giá thành công!"));
    }

    // ==========================================
    // HELPER WEBSOCKET
    // ==========================================

    private void notifyNewFeedback(FeedbackResponseDTO feedback) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "NEW_FEEDBACK");
            payload.put("message", "Vừa có đánh giá " + feedback.getRating() + "⭐ mới!");
            payload.put("data", feedback);

            // 1. Broadcast channel chung cho cả trang Khách & Nhân viên cùng nghe
            messagingTemplate.convertAndSend("/topic/feedbacks", payload);

            // 2. Broadcast channel theo món ăn (nếu Frontend cần lắng nghe trực tiếp trang chi tiết món)
            if (feedback.getItemId() != null) {
                messagingTemplate.convertAndSend("/topic/item/" + feedback.getItemId() + "/feedbacks", payload);
            }

        } catch (Exception e) {
            log.error("Lỗi gửi WebSocket thông báo Feedback: {}", e.getMessage());
        }
    }
}