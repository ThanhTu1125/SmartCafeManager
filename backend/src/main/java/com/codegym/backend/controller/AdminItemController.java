package com.codegym.backend.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.codegym.backend.dto.ItemResponse;
import com.codegym.backend.service.AdminItemService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin/items")
@CrossOrigin("*")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminItemController {

    private final AdminItemService adminItemService;

    // 1. LẤY TOÀN BỘ DANH SÁCH MÓN ĂN
    @GetMapping
    public ResponseEntity<List<ItemResponse>> getAllItems() {
        return ResponseEntity.ok(adminItemService.getAllItems());
    }

    // 2. LẤY DANH SÁCH MÓN ĂN ĐÃ XÓA MỀM (Ẩn / Ngưng phục vụ)
    @GetMapping("/deleted")
    public ResponseEntity<List<ItemResponse>> getDeletedItems() {
        return ResponseEntity.ok(adminItemService.getDeletedItems());
    }

    // 3. LẤY CHI TIẾT MỘT MÓN ĂN THEO ID
    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(adminItemService.getItemById(id));
    }

    // 4. THÊM MỚI MÓN ĂN
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ItemResponse> createItem(
            @RequestParam("itemCode") String itemCode,
            @RequestParam("itemName") String itemName,
            @RequestParam("price") BigDecimal price,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "newCategoryName", required = false) String newCategoryName,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        ItemResponse newItem = adminItemService.createItem(
                itemCode, itemName, price, description, categoryId, newCategoryName, image);
        return ResponseEntity.status(HttpStatus.CREATED).body(newItem);
    }

    // 5. CẬP NHẬT MÓN ĂN
    @PostMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ItemResponse> updateItem(
            @PathVariable Long id,
            @RequestParam(value = "itemCode", required = false) String itemCode,
            @RequestParam(value = "itemName", required = false) String itemName,
            @RequestParam(value = "price", required = false) BigDecimal price,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "newCategoryName", required = false) String newCategoryName,
            @RequestParam(value = "isAvailable", required = false) Boolean isAvailable,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        ItemResponse updatedItem = adminItemService.updateItem(
                id, itemCode, itemName, price, description, categoryId, newCategoryName, isAvailable, image);
        return ResponseEntity.ok(updatedItem);
    }

    // 6. XÓA MÓN ĂN (Ẩn món - Xóa mềm)
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteItem(@PathVariable Long id) {
        adminItemService.deleteItem(id);
        return ResponseEntity.ok(Map.of("message", "Đã ngưng phục vụ món ăn thành công!"));
    }

    // 7. KHÔI PHÚC MÓN ĂN ĐÃ XÓA MỀM
    @PutMapping("/{id}/restore")
    public ResponseEntity<Map<String, String>> restoreItem(@PathVariable Long id) {
        adminItemService.restoreItem(id);
        return ResponseEntity.ok(Map.of("message", "Đã khôi phục món ăn thành công!"));
    }
}