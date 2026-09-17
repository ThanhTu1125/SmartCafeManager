package com.codegym.backend.service;

import com.codegym.backend.dto.FeedbackRequestDTO;
import com.codegym.backend.dto.FeedbackResponseDTO;
import com.codegym.backend.entity.Customer;
import com.codegym.backend.entity.Feedback;
import com.codegym.backend.entity.Item;
import com.codegym.backend.repository.CustomerRepository;
import com.codegym.backend.repository.FeedbackRepository;
import com.codegym.backend.repository.ItemRepository;
import com.codegym.backend.repository.OrderDetailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.IOException; // 🟢 THÊM IMPORT NÀY
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final CustomerRepository customerRepository;
    private final ItemRepository itemRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final CloudinaryService cloudinaryService;

    // 1. TẠO FEEDBACK VÀ TRẢ VỀ DTO
    @Override
    @Transactional
    public FeedbackResponseDTO createFeedback(FeedbackRequestDTO dto) {
        // Kiểm tra itemId
        Item item = itemRepository.findById(dto.getItemId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn để đánh giá!"));

        // Chỉ kiểm tra món ăn có trong đơn hay không
        if (dto.getOrderId() != null) {
            boolean isItemInOrder = orderDetailRepository.existsByOrderTableOrderIdAndItemItemId(
                    dto.getOrderId(),
                    dto.getItemId());

            if (!isItemInOrder) {
                throw new RuntimeException("Đơn hàng #" + dto.getOrderId() + " không chứa món ăn này!");
            }
        }

        // 2. XỬ LÝ UPLOAD ẢNH LÊN CLOUDINARY (ĐÃ BỌC TRY-CATCH)ssdas
        String finalImageUrl = dto.getImageUrl();
        if (dto.getImageFile() != null && !dto.getImageFile().isEmpty()) {
            try {
                finalImageUrl = cloudinaryService.uploadImage(dto.getImageFile());
            } catch (IOException e) {
                throw new RuntimeException("Lỗi tải ảnh lên Cloudinary: " + e.getMessage());
            }
        }

        // Kiểm tra đăng nhập để lấy thông tin Customer
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Customer customer = null;
        String email = dto.getEmail();
        String senderName = dto.getSenderName();

        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            customer = customerRepository.findByAccountUsername(auth.getName()).orElse(null);

            if (customer != null) {
                if (!StringUtils.hasText(email) && customer.getAccount() != null) {
                    email = customer.getAccount().getEmail();
                }
                if (!StringUtils.hasText(senderName)) {
                    senderName = customer.getFullName();
                }
            }
        }

        if (!StringUtils.hasText(senderName)) {
            senderName = "Khách hàng";
        }

        // Lưu Feedback với finalImageUrl đã xử lý
        Feedback feedback = Feedback.builder()
                .content(dto.getContent())
                .rating(dto.getRating())
                .senderName(senderName)
                .email(email)
                .imageUrl(finalImageUrl)
                .sentAt(LocalDateTime.now())
                .customer(customer)
                .item(item)
                .build();

        Feedback savedFeedback = feedbackRepository.save(feedback);
        return mapToResponseDTO(savedFeedback);
    }

    @Override
    @Transactional
    public void saveFeedback(FeedbackRequestDTO dto) {
        createFeedback(dto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponseDTO> getFeedbacksByItem(Long itemId) {
        return feedbackRepository.findByItemItemIdAndDeletedAtIsNull(itemId)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponseDTO> getAllFeedbacks() {
        return feedbackRepository.findByDeletedAtIsNull()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteFeedback(Long feedbackId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá ID: " + feedbackId));

        feedback.setDeletedAt(new Date());
        feedbackRepository.save(feedback);
    }

    // --- HELPER METHOD ---
    private FeedbackResponseDTO mapToResponseDTO(Feedback feedback) {
        Date sentAtDate = null;
        if (feedback.getSentAt() != null) {
            sentAtDate = Date.from(feedback.getSentAt().atZone(ZoneId.systemDefault()).toInstant());
        }

        return FeedbackResponseDTO.builder()
                .feedbackId(feedback.getFeedbackId())
                .content(feedback.getContent())
                .rating(feedback.getRating())
                .senderName(feedback.getSenderName())
                .email(feedback.getEmail())
                .imageUrl(feedback.getImageUrl())
                .sentAt(sentAtDate)
                .customerId(feedback.getCustomer() != null ? feedback.getCustomer().getCustomerId() : null)
                .itemId(feedback.getItem() != null ? feedback.getItem().getItemId() : null)
                .itemName(feedback.getItem() != null ? feedback.getItem().getItemName() : null)
                .build();
    }
}