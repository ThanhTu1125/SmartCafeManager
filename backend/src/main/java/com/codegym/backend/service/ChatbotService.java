package com.codegym.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
@SuppressWarnings("null")
public class ChatbotService {

    @Value("${groq.api.key:}")
    private String apiKey;

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String apiUrl;

    @Value("${groq.api.model:llama-3.1-8b-instant}")
    private String apiModel;

    private final RestTemplate restTemplate = new RestTemplate();

    public String askAi(String userMessage) {
        try {
            String safeApiKey = (apiKey != null) ? apiKey.trim() : "";
            String safeApiUrl = (apiUrl != null) ? apiUrl.trim() : "https://api.groq.com/openai/v1/chat/completions";
            String safeModel = (apiModel != null) ? apiModel.trim() : "llama-3.1-8b-instant";
            String safeUserMsg = (userMessage != null) ? userMessage : "";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(safeApiKey);

            String systemPrompt = "Bạn là nhân viên tư vấn nhiệt tình của SmartCafe. " +
                    "Nhiệm vụ của bạn là tư vấn món ăn, đồ uống ngắn gọn, lịch sự, thân thiện. " +
                    "Menu: Cà phê sữa , Bạc xỉu , Trà đào cam sả , Sinh tố bơ . " +
                    "Nếu khách hỏi món không có trong menu, hãy khéo léo gợi ý món có sẵn.";

            List<Map<String, String>> messages = new ArrayList<>();

            Map<String, String> sysMsg = new HashMap<>();
            sysMsg.put("role", "system");
            sysMsg.put("content", systemPrompt);
            messages.add(sysMsg);

            Map<String, String> usrMsg = new HashMap<>();
            usrMsg.put("role", "user");
            usrMsg.put("content", safeUserMsg);
            messages.add(usrMsg);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", safeModel);
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<JsonNode> response = restTemplate.postForEntity(safeApiUrl, entity, JsonNode.class);

            JsonNode body = response.getBody();
            if (response.getStatusCode().is2xxSuccessful() && body != null) {
                JsonNode choices = body.get("choices");
                if (choices != null && choices.isArray() && !choices.isEmpty()) {
                    JsonNode messageNode = choices.get(0).get("message");
                    if (messageNode != null && messageNode.has("content")) {
                        
                        // XỬ LÝ CẮT BỎ THẺ <THINK> Ở ĐÂY
                        String rawReply = messageNode.get("content").asText();
                        if (rawReply.contains("</think>")) {
                            rawReply = rawReply.substring(rawReply.indexOf("</think>") + 8).trim();
                        }
                        return rawReply;
                        
                    }
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi kết nối Groq AI API: ", e);
            return "Em đang bận phục vụ bàn khác một chút, anh/chị nhắn lại sau vài giây nhé!";
        }
        return "Rất tiếc, hiện tại em chưa hiểu ý anh/chị.";
    }
}