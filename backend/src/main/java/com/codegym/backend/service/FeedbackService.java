package com.codegym.backend.service;

import com.codegym.backend.dto.FeedbackRequestDTO;
import com.codegym.backend.dto.FeedbackResponseDTO;
import java.util.List;

public interface FeedbackService {
    void saveFeedback(FeedbackRequestDTO dto);

    FeedbackResponseDTO createFeedback(FeedbackRequestDTO dto);

    List<FeedbackResponseDTO> getFeedbacksByItem(Long itemId);

    List<FeedbackResponseDTO> getAllFeedbacks();

    void deleteFeedback(Long feedbackId);
}