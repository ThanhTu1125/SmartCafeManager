package com.codegym.backend.repository;

import com.codegym.backend.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByItemItemIdAndDeletedAtIsNull(Long itemId);

    List<Feedback> findByDeletedAtIsNull();

    boolean existsByCustomerCustomerIdAndItemItemIdAndDeletedAtIsNull(Long customerId, Long itemId);

    boolean existsByEmailAndItemItemIdAndDeletedAtIsNull(String email, Long itemId);
}