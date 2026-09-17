package com.codegym.backend.controller;

import com.codegym.backend.dto.AdminTableOrderRequestDTO;
import com.codegym.backend.dto.TableOrderResponseDTO;
import com.codegym.backend.service.AdminTableOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminTableOrderController {

    private final AdminTableOrderService adminTableOrderService;

    // Lấy tất cả hóa đơn (mới nhất lên đầu)
    @GetMapping
    public ResponseEntity<List<TableOrderResponseDTO>> getAllOrders() {
        return ResponseEntity.ok(adminTableOrderService.getAllOrders());
    }

    // Cập nhật thông tin hóa đơn
    @PutMapping("/{orderId}")
    public ResponseEntity<TableOrderResponseDTO> updateOrder(
            @PathVariable Long orderId,
            @RequestBody AdminTableOrderRequestDTO dto) {
        return ResponseEntity.ok(adminTableOrderService.updateOrder(orderId, dto));
    }

    // Xóa mềm / Hủy hóa đơn
    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> softDeleteOrder(
            @PathVariable Long orderId,
            @RequestParam(required = false, defaultValue = "") String reason) {
        adminTableOrderService.softDeleteOrder(orderId, reason);
        return ResponseEntity.noContent().build();
    }
}