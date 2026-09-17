package com.codegym.backend.controller;

import com.codegym.backend.dto.ChatRequestDTO;
import com.codegym.backend.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/chatbot")
@CrossOrigin("*")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody ChatRequestDTO request) {
        String reply = chatbotService.askAi(request.getMessage());
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}