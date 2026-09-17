package com.codegym.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.codegym.backend.dto.NewsRequest;
import com.codegym.backend.enums.NewsStatus;
import com.codegym.backend.service.NewsService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    // ==========================================
    // 1. PUBLIC API (KHÁCH HÀNG / VÃNG LAI)
    // ==========================================

    /**
     * Lấy danh sách tin tức (Có phân trang, bỏ qua nội dung chi tiết)
     * Chỉ lấy các bài viết có trạng thái PUBLISHED
     */
    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> getAllNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(newsService.getAllNews(page, size));
    }

    /**
     * Lấy chi tiết 1 bài viết tin tức dựa vào ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> getNewsById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(newsService.getNewsById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==========================================
    // 2. STAFF & ADMIN API (QUẢN LÝ BÀI VIẾT)
    // ==========================================

    /**
     * Tạo mới một bài viết tin tức.
     * Cần quyền ADMIN hoặc STAFF.
     */
    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> createNews(
            @Valid @ModelAttribute NewsRequest request) throws Exception {
        return ResponseEntity.ok(newsService.createNews(request));
    }

    /**
     * Cập nhật thông tin của một bài viết tin tức đã tồn tại.
     */
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> updateNews(
            @PathVariable Long id,
            @Valid @ModelAttribute NewsRequest request) throws Exception {
        return ResponseEntity.ok(newsService.updateNews(id, request));
    }

    /**
     * STAFF: Lấy danh sách bài viết của chính mình.
     */
    @GetMapping("/my-news")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<?> getMyNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(newsService.getMyNews(page, size));
    }

    /**
     * Xóa mềm một bài viết tin tức.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> deleteNews(@PathVariable Long id) {
        try {
            newsService.deleteNews(id);
            return ResponseEntity.ok("Xóa tin tức thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==========================================
    // 3. ADMIN ONLY API (PHÊ DUYỆT & QUẢN TRỊ TỔNG)
    // ==========================================

    /**
     * Dành cho Admin: Lấy tất cả bài viết (kể cả PENDING, REJECTED)
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllNewsForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(newsService.getAllNewsForAdmin(page, size));
    }

    /**
     * Dành cho Admin: Duyệt bài hoặc Đổi trạng thái bài viết
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> changeNewsStatus(
            @PathVariable Long id,
            @RequestParam NewsStatus status) {
        try {
            return ResponseEntity.ok(newsService.changeNewsStatus(id, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * STAFF: Lấy danh sách bảng tin chung (Bài của mình + Bài người khác đã duyệt)
     */
    @GetMapping("/staff/feed")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<?> getStaffFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(newsService.getStaffFeed(page, size));
    }
}