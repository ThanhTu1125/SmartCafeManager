package com.codegym.backend.service;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.lang.NonNull;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class NotificationService {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    private static final long SSE_TIMEOUT = 30L * 60 * 1000;

    public SseEmitter addEmitter() {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        this.emitters.add(emitter);

        emitter.onCompletion(() -> removeEmitter(emitter));
        emitter.onTimeout(() -> removeEmitter(emitter));
        emitter.onError((e) -> removeEmitter(emitter));

        return emitter;
    }

    private void removeEmitter(SseEmitter emitter) {
        this.emitters.remove(emitter);
    }

    public void sendNotification(@NonNull String message) {
        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(message));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }

        if (!deadEmitters.isEmpty()) {
            this.emitters.removeAll(deadEmitters);
            log.info("Đã dọn dẹp {} kết nối SSE không còn hoạt động.", deadEmitters.size());
        }
    }

    /**
     * Cơ chế Heartbeat (Ping): Chạy định kỳ mỗi 30 giây.
     * Gửi tín hiệu ping xuống client để giữ kết nối không bị Firewall/Proxy ngắt,
     * đồng thời chủ động phát hiện và xóa ngay các kết nối ma (dead connections).
     */
    @Scheduled(fixedRate = 30000)
    public void sendHeartbeat() {
        if (emitters.isEmpty())
            return;

        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("ping")
                        .data("heartbeat"));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }

        if (!deadEmitters.isEmpty()) {
            this.emitters.removeAll(deadEmitters);
            log.debug("Heartbeat: Đã xóa {} kết nối ngắt ngầm.", deadEmitters.size());
        }
    }
}