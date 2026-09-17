package com.codegym.backend.controller;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import com.codegym.backend.dto.TableOrderInvoiceDTO;
import com.codegym.backend.dto.TableOrderSummaryDTO;
import com.codegym.backend.enums.PaymentMethod;
import com.codegym.backend.service.PayPalService;
import com.codegym.backend.service.PaymentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/customer/payment")
@CrossOrigin("*")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PayPalService payPalService;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    // --- HÓA ĐƠN & THANH TOÁN TẠI QUÁN ---

    @GetMapping("/invoice")
    public ResponseEntity<TableOrderInvoiceDTO> getCurrentInvoice(
            @RequestParam Long tableId,
            @RequestParam Long tableOrderId) {
        return ResponseEntity.ok(paymentService.getCurrentInvoice(tableId, tableOrderId));
    }

    @PostMapping("/complete-checkout")
    public ResponseEntity<String> completeCheckout(
            @RequestParam Long tableId,
            @RequestParam PaymentMethod paymentMethod) {

        paymentService.completeCheckout(tableId, paymentMethod);
        notifyStaffCheckout(tableId, "Bàn " + tableId + " đã hoàn tất thanh toán & sẵn sàng đón khách mới.");

        return ResponseEntity.ok("Thanh toán thành công! Hóa đơn đã chốt và bàn đã giải phóng.");
    }

    // --- INTEGRATION PAYPAL ---

    @PostMapping("/paypal")
    public ResponseEntity<?> createPayPalPayment(@RequestParam Long tableId) {
        try {
            TableOrderSummaryDTO invoice = paymentService.getInvoiceSummaryDTO(tableId);
            if (invoice == null || invoice.getTotalAmount() == null
                    || invoice.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest()
                        .body("Bàn " + tableId + " hiện chưa có món ăn hoặc tổng tiền bằng 0. Không thể thanh toán!");
            }
            String returnUrl = "http://localhost:8080/api/v1/customer/payment/paypal/success?tableId=" + tableId;
            String cancelUrl = "http://localhost:8080/api/v1/customer/payment/paypal/cancel?tableId=" + tableId;

            String approvalUrl = payPalService.createPayPalOrder(invoice.getTotalAmount(), returnUrl, cancelUrl);
            String qrCodeImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + approvalUrl;

            Map<String, String> response = Map.of(
                    "approvalUrl", approvalUrl,
                    "qrCodeUrl", qrCodeImageUrl);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error(" Lỗi tạo thanh toán PayPal cho Bàn {}: {}", tableId, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Lỗi tạo thanh toán PayPal: " + e.getMessage());
        }
    }

    // ✅ THANH TOÁN THÀNH CÔNG: Chuyển hướng về Frontend
    @GetMapping("/paypal/success")
    public RedirectView paymentSuccess(
            @RequestParam(value = "paymentId", required = false) String paymentId,
            @RequestParam(value = "token", required = false) String token,
            @RequestParam("PayerID") String payerId,
            @RequestParam("tableId") Long tableId) {
        try {
            String actualPaymentId = (paymentId != null && !paymentId.isEmpty()) ? paymentId : token;
            boolean isExecuted = payPalService.executePayment(actualPaymentId, payerId);

            if (isExecuted) {
                // 1. Chốt đơn & Giải phóng bàn trong DB
                paymentService.completeCheckout(tableId, PaymentMethod.PAYPAL);

                // 2. Bắn tin nhắn WebSocket cho Thu ngân
                notifyStaffCheckout(tableId, "Bàn " + tableId + " đã thanh toán PayPal thành công.");

                // 3. Chuyển hướng về trang Success của Frontend
                return new RedirectView(frontendUrl + "/payment-success?tableId=" + tableId);
            }
        } catch (Exception e) {
            log.error(" Lỗi xác thực PayPal Success cho Bàn {}: {}", tableId, e.getMessage(), e);
        }

        // Chuyển hướng về trang Failed của Frontend nếu thất bại
        return new RedirectView(frontendUrl + "/payment-failed?tableId=" + tableId);
    }

    // ✅ HỦY THANH TOÁN: Chuyển hướng về Frontend
    @GetMapping("/paypal/cancel")
    public RedirectView paymentCancel(@RequestParam("tableId") Long tableId) {
        return new RedirectView(frontendUrl + "/payment-cancel?tableId=" + tableId);
    }

    // --- HELPER METHOD ---

    private void notifyStaffCheckout(Long tableId, String message) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("tableId", tableId);
        payload.put("type", "CHECKOUT_COMPLETED");
        payload.put("message", message);
        messagingTemplate.convertAndSend("/topic/staff-requests", payload);
    }
}