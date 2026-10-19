package com.codegym.backend.controller;

import com.codegym.backend.dto.CartItemRequestDTO;
import com.codegym.backend.dto.CartResponseDTO;
import com.codegym.backend.dto.TableOrderSummaryDTO;
import com.codegym.backend.entity.Tables;
import com.codegym.backend.enums.ServiceStatus;
import com.codegym.backend.service.CartService;
import com.codegym.backend.service.OrderService;
import com.codegym.backend.service.PaymentService;
import com.codegym.backend.service.StaffOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/customer")
@CrossOrigin("*")
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class CustomerController {

    private final CartService cartService;
    private final OrderService orderService;
    private final PaymentService paymentService;
    private final StaffOrderService staffOrderService;
    private final SimpMessagingTemplate messagingTemplate;


    @PostMapping("/call-service")
    public ResponseEntity<Map<String, String>> callStaff(@RequestParam Long tableId) {
        
        orderService.updateTableServiceStatus(tableId, ServiceStatus.CALL_STAFF);

        messagingTemplate.convertAndSend(
                "/topic/table-events",
                Map.of(
                        "type", "CALL_STAFF",
                        "tableId", tableId,
                        "message", "Bàn " + tableId + " đang gọi nhân viên!",
                        "timestamp", System.currentTimeMillis()
                )
        );

        messagingTemplate.convertAndSend(
                "/topic/tables/" + tableId,
                Map.of(
                        "type", "SERVICE_STATUS_CHANGED",
                        "serviceStatus", "CALL_STAFF",
                        "message", "Đã gửi yêu cầu gọi nhân viên!"
                )
        );

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Đã gọi nhân viên thành công!"
        ));
    }


    @GetMapping("/cart/{tableId}")
    public ResponseEntity<CartResponseDTO> getCartOverview(@PathVariable Long tableId) {
        return ResponseEntity.ok(cartService.getCartOverview(tableId));
    }

    @PostMapping("/cart/add")
    public ResponseEntity<Map<String, String>> addItemToCart(@Valid @RequestBody CartItemRequestDTO dto) {
        cartService.addItemToCart(dto.getTableId(), dto.getItemId(), dto.getQuantity(), dto.getNote());
        notifyCartUpdate(dto.getTableId());
        return ResponseEntity.ok(Map.of("message", "Đã thêm món vào giỏ hàng tạm!"));
    }

    @PutMapping("/cart/items/{itemId}")
    public ResponseEntity<Map<String, String>> updateCartItemDetail(
            @RequestParam Long tableId,
            @PathVariable Long itemId,
            @RequestParam(required = false) Integer quantity,
            @RequestParam(required = false) String note) {

        if (quantity != null && quantity <= 0) {
            cartService.removeItemFromCart(tableId, itemId);
            notifyCartUpdate(tableId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa món khỏi giỏ hàng!"));
        }

        cartService.updateCartItemDetail(tableId, itemId, quantity, note);
        notifyCartUpdate(tableId);
        return ResponseEntity.ok(Map.of("message", "Cập nhật giỏ hàng thành công!"));
    }

    @DeleteMapping("/cart/items/{itemId}")
    public ResponseEntity<Map<String, String>> removeItemFromCart(
            @RequestParam Long tableId,
            @PathVariable Long itemId) {
            
        cartService.removeItemFromCart(tableId, itemId);
        notifyCartUpdate(tableId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa món ăn khỏi giỏ hàng!"));
    }

    @DeleteMapping("/cart/clear")
    public ResponseEntity<Map<String, String>> clearCart(@RequestParam Long tableId) {
        cartService.clearTemporaryCart(tableId);
        notifyCartUpdate(tableId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa toàn bộ món trong giỏ hàng tạm!"));
    }


    @PostMapping("/confirm-order")
    public ResponseEntity<Map<String, String>> confirmOrder(@RequestParam Long tableId) {
        cartService.confirmOrder(tableId);

        Tables table = staffOrderService.getTableInfo(tableId);
        String tableName = (table != null && table.getTableName() != null) ? table.getTableName() : "Bàn " + tableId;

        messagingTemplate.convertAndSend(
                "/topic/table-events",
                Map.of(
                        "type", "NEW_ORDER", 
                        "tableId", tableId,
                        "tableName", tableName,
                        "message", tableName + " vừa gửi đơn hàng mới xuống bếp!",
                        "timestamp", System.currentTimeMillis()
                )
        );

        notifyCartUpdate(tableId);

        messagingTemplate.convertAndSend(
                "/topic/tables/" + tableId,
                Map.of(
                        "type", "ORDER_PLACED",
                        "message", "Đơn hàng đã được gửi thành công!"
                )
        );

        return ResponseEntity.ok(Map.of("message", "Đã gửi đơn hàng thành công xuống bếp!"));
    }


    @PostMapping("/payment/cash")
    public ResponseEntity<Map<String, String>> processCashPayment(@RequestParam Long tableId) {
        paymentService.processCashPayment(tableId);

        messagingTemplate.convertAndSend(
                "/topic/table-events",
                Map.of(
                        "type", "PAYMENT_REQUEST",
                        "tableId", tableId,
                        "message", "Bàn " + tableId + " yêu cầu thanh toán tiền mặt!",
                        "timestamp", System.currentTimeMillis()
                )
        );

        messagingTemplate.convertAndSend(
                "/topic/tables/" + tableId,
                Map.of(
                        "type", "PAYMENT_REQUESTED",
                        "message", "Vui lòng chờ nhân viên đến bàn thu tiền mặt."
                )
        );

        return ResponseEntity.ok(Map.of("message", "Đã gửi yêu cầu thanh toán tiền mặt. Vui lòng chờ nhân viên!"));
    }

    @GetMapping("/invoice-summary/{tableId}")
    public ResponseEntity<TableOrderSummaryDTO> getInvoiceSummary(@PathVariable Long tableId) {
        return ResponseEntity.ok(paymentService.getInvoiceSummaryDTO(tableId));
    }


    private void notifyCartUpdate(Long tableId) {
        Map<String, Object> payload = Map.of(
                "type", "CART_UPDATED",
                "tableId", tableId,
                "message", "Giỏ hàng tạm đã được cập nhật!"
        );

        messagingTemplate.convertAndSend("/topic/tables/" + tableId, payload);
        
        messagingTemplate.convertAndSend("/topic/tables/" + tableId + "/cart", payload);
    }
}