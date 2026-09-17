package com.codegym.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponseDTO {
    private Long feedbackId;
    private String content;
    private Integer rating;
    private String senderName;
    private String email;
    private String imageUrl;
    private Date sentAt;
    private Long customerId;
    private Long itemId;
    private String itemName;
}