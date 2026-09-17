package com.codegym.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id")
    private Long feedbackId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false) // Bắt buộc phải gắn với 1 món
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = true) // Allow NULL cho khách chưa đăng nhập
    private Customer customer;

    @Column(name = "sender_name", nullable = false)
    private String senderName;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "content") 
    private String content;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt; 
}