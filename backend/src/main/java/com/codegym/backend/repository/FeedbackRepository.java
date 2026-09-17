package com.codegym.backend.repository;

import com.codegym.backend.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    // 1. Lấy feedback của món ăn cụ thể (bỏ qua các feedback đã xoá)
    List<Feedback> findByItemItemIdAndDeletedAtIsNull(Long itemId);

    // 2. Lấy tất cả feedback active (cho Staff/Admin)
    List<Feedback> findByDeletedAtIsNull();

    // 3. Kiểm tra Khách hàng đã đăng nhập đã đánh giá món ăn này chưa
    boolean existsByCustomerCustomerIdAndItemItemIdAndDeletedAtIsNull(Long customerId, Long itemId);

    // Kiểm tra Khách vãng lai (theo Email) đã đánh giá món ăn này chưa
    boolean existsByEmailAndItemItemIdAndDeletedAtIsNull(String email, Long itemId);
}