package com.codegym.backend.controller;

import com.codegym.backend.dto.ActiveOrderDTO;
import com.codegym.backend.dto.OrderDetailResponseDTO;
import com.codegym.backend.entity.Tables;
import com.codegym.backend.enums.ServiceStatus;
import com.codegym.backend.service.StaffOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/staff")
@CrossOrigin("*")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public class StaffController {

    private final StaffOrderService staffOrderService;
    private final SimpMessagingTemplate messagingTemplate;

    // ==========================================
    // I. LẤY SƠ ĐỒ BÀN & THÔNG TIN ĐƠN HÀNG
    // ==========================================
    @GetMapping("/tables")
    public ResponseEntity<List<Tables>> getAllTables() {
        return ResponseEntity.ok(staffOrderService.getAllTables());
    }

    @GetMapping("/tables/{tableId}")
    public ResponseEntity<Tables> getTableInfo(@PathVariable Long tableId) {
        return ResponseEntity.ok(staffOrderService.getTableInfo(tableId));
    }

    @GetMapping("/tables/{tableId}/active-order")
    public ResponseEntity<ActiveOrderDTO> getActiveOrderByTable(@PathVariable Long tableId) {
        return ResponseEntity.ok(staffOrderService.getActiveOrderByTable(tableId));
    }

    @GetMapping("/tables/{tableId}/order-details")
    public ResponseEntity<List<OrderDetailResponseDTO>> getOrderDetailsByTable(@PathVariable Long tableId) {
        return ResponseEntity.ok(staffOrderService.getOrderDetailsByTable(tableId));
    }

    // ==========================================
    // II. XỬ LÝ HÀNG LOẠT THEO LƯỢT ORDER CỦA BÀN
    // ==========================================
    @PutMapping("/tables/{tableId}/confirm-all")
    public ResponseEntity<Map<String, String>> confirmAllNewItemsByTable(@PathVariable Long tableId) {
        staffOrderService.confirmAllNewItemsByTable(tableId);
        
        // Báo cho cả Nhân viên lẫn Khách hàng
        sendStaffUpdate(tableId, "NEW_ORDER_SUBMITTED");
        sendCustomerUpdate(tableId, "ORDER_CONFIRMED", "Đơn hàng của bạn đã được bếp tiếp nhận!");
        
        return ResponseEntity.ok(Map.of("message", "Đã duyệt nhận đơn lượt mới!"));
    }

    @PutMapping("/tables/{tableId}/serve-all")
    public ResponseEntity<Map<String, String>> serveAllItemsByTable(@PathVariable Long tableId) {
        staffOrderService.serveAllItemsByTable(tableId);
        
        sendStaffUpdate(tableId, "TABLE_UPDATED");
        sendCustomerUpdate(tableId, "FOOD_SERVED", "Tất cả món ăn đã được phục vụ!");
        
        return ResponseEntity.ok(Map.of("message", "Đã hoàn thành và phục vụ tất cả món lượt này!"));
    }

    // ==========================================
    // III. XỬ LÝ ĐƠN HÀNG VÀ THANH TOÁN BÀN
    // ==========================================
    @PutMapping("/orders/{tableOrderId}/confirm")
    public ResponseEntity<Map<String, String>> confirmOrderItems(@PathVariable Long tableOrderId) {
        staffOrderService.confirmOrderItems(tableOrderId);
        
        // [ĐÃ FIX] Bổ sung bắn WebSocket để màn hình Staff tự cập nhật
        sendStaffUpdate(null, "ORDER_CONFIRMED");
        
        return ResponseEntity.ok(Map.of("message", "Đã xác nhận đơn hàng!"));
    }

    @PostMapping("/tables/{tableId}/approve-payment")
    public ResponseEntity<Map<String, String>> approvePayment(@PathVariable Long tableId) {
        staffOrderService.approveCashPayment(tableId);
        
        // [ĐÃ FIX] Bắn 1 tin chuẩn cho Staff giải phóng bàn
        sendStaffUpdate(tableId, "TABLE_CLEARED"); 
        
        // Báo cho Khách hàng biết thanh toán đã hoàn tất -> Frontend Khách dọn giỏ/chuyển màn hình Cảm ơn
        sendCustomerUpdate(tableId, "PAYMENT_APPROVED", "Thanh toán thành công. Cảm ơn quý khách!");

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Đã duyệt thanh toán và giải phóng bàn thành công!"
        ));
    }

    @PostMapping("/tables/{tableId}/cancel")
    public ResponseEntity<Map<String, String>> cancelTableOrder(
            @PathVariable Long tableId,
            @RequestParam(required = false, defaultValue = "Nhân viên hủy đơn") String reason) {

        staffOrderService.cancelTableOrder(tableId, reason);
        
        // [ĐÃ FIX] Bỏ bắn đúp 2 tin
        sendStaffUpdate(tableId, "TABLE_CLEARED");
        sendCustomerUpdate(tableId, "ORDER_CANCELLED", "Đơn hàng đã bị hủy. Lý do: " + reason);

        return ResponseEntity.ok(Map.of("message", "Đã hủy đơn hàng và giải phóng bàn thành công!"));
    }

    @PutMapping("/tables/{tableId}/status")
    public ResponseEntity<Map<String, String>> updateTableStatus(
            @PathVariable Long tableId,
            @RequestParam ServiceStatus status) {

        staffOrderService.updateTableServiceStatus(tableId, status);
        sendStaffUpdate(tableId, "TABLE_UPDATED");
        sendCustomerUpdate(tableId, "STATUS_CHANGED", "Trạng thái bàn đã cập nhật: " + status);
        
        return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái bàn thành công!"));
    }

    // ==========================================
    // IV. THAO TÁC MÓN LẺ
    // ==========================================
    @PutMapping("/tables/{tableId}/order-details/{orderDetailId}/serve")
    public ResponseEntity<Map<String, String>> markItemAsServed(
            @PathVariable Long tableId,
            @PathVariable Long orderDetailId) {

        staffOrderService.markItemAsServed(orderDetailId);
        sendStaffUpdate(tableId, "TABLE_UPDATED");
        sendCustomerUpdate(tableId, "ITEM_SERVED", "Món ăn đã được mang ra bàn!");
        
        return ResponseEntity.ok(Map.of("message", "Đã chuyển món sang SERVED!"));
    }

    @PutMapping("/tables/{tableId}/order-details/{orderDetailId}/cancel")
    public ResponseEntity<Map<String, String>> cancelOrderItem(
            @PathVariable Long tableId,
            @PathVariable Long orderDetailId,
            @RequestParam(required = false, defaultValue = "Hết món") String reason) {

        staffOrderService.cancelOrderItem(orderDetailId, reason);
        sendStaffUpdate(tableId, "TABLE_UPDATED");
        sendCustomerUpdate(tableId, "ITEM_CANCELLED", "Một món ăn đã bị hủy. Lý do: " + reason);
        
        return ResponseEntity.ok(Map.of("message", "Đã hủy món và cập nhật lại tổng tiền!"));
    }

// CHỈ ADMIN MỚI CÓ QUYỀN SỬA SỐ LƯỢNG / GHI CHÚ
    @PutMapping("/tables/{tableId}/order-details/{orderDetailId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateOrderItem(
            @PathVariable Long tableId,
            @PathVariable Long orderDetailId,
            @RequestParam Integer quantity,
            @RequestParam(required = false) String note) {

        staffOrderService.updateOrderItem(orderDetailId, quantity, note);
        return ResponseEntity.ok(Map.of("message", "Admin đã cập nhật món thành công!"));
    }

    // CHỈ ADMIN MỚI CÓ QUYỀN XÓA MÓN
    @DeleteMapping("/tables/{tableId}/order-details/{orderDetailId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteOrderItem(
            @PathVariable Long tableId,
            @PathVariable Long orderDetailId) {

        staffOrderService.deleteOrderItem(orderDetailId);
        return ResponseEntity.ok(Map.of("message", "Admin đã xóa món khỏi đơn!"));
    }

    // ==========================================
    // HÀM HỖ TRỢ GỬI WEBSOCKET
    // ==========================================

    // 1. Phát tới Màn hình Nhân viên & Sơ đồ bàn POS
    private void sendStaffUpdate(Long tableId, String type) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", type);
            if (tableId != null) payload.put("tableId", tableId);
            payload.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend("/topic/staff/tables", payload);
        } catch (Exception e) {
            log.error("Lỗi gửi WebSocket cho Staff: {}", e.getMessage());
        }
    }

    // 2. Phát tới Điện thoại của Khách hàng đang ngồi tại Bàn
    private void sendCustomerUpdate(Long tableId, String type, String message) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", type);
            payload.put("tableId", tableId);
            payload.put("message", message);
            payload.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend("/topic/tables/" + tableId + "/orders", payload);
        } catch (Exception e) {
            log.error("Lỗi gửi WebSocket cho Khách bàn {}: {}", tableId, e.getMessage());
        }
    }
}