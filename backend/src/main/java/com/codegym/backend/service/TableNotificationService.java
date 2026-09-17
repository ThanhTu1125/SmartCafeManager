package com.codegym.backend.service;

import com.codegym.backend.dto.TableEventDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TableNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyTableEvent(String type, String message, Long tableId) {
        TableEventDTO payload = new TableEventDTO(type, message, tableId);
        // Bắn trực tiếp vào channel /topic/table-events
        messagingTemplate.convertAndSend("/topic/table-events", payload);
    }
}