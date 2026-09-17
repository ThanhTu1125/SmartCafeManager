package com.codegym.backend.controller;

import com.codegym.backend.service.StaffItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/staff/items")
@RequiredArgsConstructor
public class StaffItemController {

    private final StaffItemService staffItemService;

    // PATCH /api/v1/staff/items/1/availability?isAvailable=true
    @PatchMapping("/{itemId}/availability")
    public ResponseEntity<String> toggleAvailability(
            @PathVariable Long itemId,
            @RequestParam Boolean isAvailable) {

        staffItemService.updateItemAvailability(itemId, isAvailable);
        return ResponseEntity.ok("Cập nhật trạng thái hiển thị món thành công!");
    }
}