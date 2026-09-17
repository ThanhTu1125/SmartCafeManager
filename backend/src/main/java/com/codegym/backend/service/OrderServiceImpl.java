package com.codegym.backend.service;

import com.codegym.backend.dto.InvoiceDetailResponseDTO;
import com.codegym.backend.entity.*;
import com.codegym.backend.enums.*;
import com.codegym.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@SuppressWarnings("null")
public class OrderServiceImpl implements OrderService {

    private final TablesRepository tablesRepository;
    private final TableOrderRepository tableOrderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ItemRepository itemRepository;
    private final FeedbackRepository feedbackRepository;
    
    // Công cụ bắn WebSocket cho nhân viên
    private final SimpMessagingTemplate messagingTemplate;

   @Override
    @Transactional
    public void updateTableServiceStatus(Long tableId, ServiceStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Trạng thái phục vụ không được để trống!");
        }

        Tables table = tablesRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Bàn không tồn tại với ID: " + tableId));

        ServiceStatus currentStatus = table.getServiceStatus();

        // 1. Kiểm tra nếu bàn đang ở trạng thái Yêu cầu thanh toán
        boolean isCurrentRequestingBill = currentStatus != null && (
                currentStatus.name().equals("REQUESTING_BILL") || 
                currentStatus.name().equals("WAITING_PAYMENT") ||
                currentStatus.name().equals("PAYMENT_REQUESTED")
        );

        // 2. Kiểm tra nếu hành động mới là Gọi nhân viên
        boolean isNewCallStaff = status.name().equals("CALLING_STAFF") || 
                                 status.name().equals("NEEDS_ATTENTION") ||
                                 status.name().equals("CALL_STAFF");

        // 🛡️ NẾU ĐANG CHỜ TÍNH TIỀN MÀ KHÁCH BẤM GỌI NHÂN VIÊN:
        // -> Giữ nguyên status trong DB (để màn hình POS giữ nút Xác nhận thanh toán)
        // -> Vẫn bắn WebSocket để chuông/thông báo ở POS rung lên
        if (isCurrentRequestingBill && isNewCallStaff) {
            log.info("Bàn {} đang chờ tính tiền, giữ nguyên trạng thái DB và chỉ gửi WebSocket gọi nhân viên.", tableId);
            sendSocketWithTransactionSync(
                "/topic/staff/tables", 
                tableId, 
                "CALL_STAFF", 
                "Bàn " + tableId + " đang gọi nhân viên! (Đang chờ tính tiền)"
            );
            return; // Dừng lại tại đây, không lưu status mới vào DB
        }

        // Cập nhật DB bình thường cho các trường hợp khác
        table.setServiceStatus(status);
        table.setIsOccupied(status != ServiceStatus.EMPTY);
        tablesRepository.save(table);

        // Phân loại tin nhắn gửi WebSocket
        String notifyType = "TABLE_UPDATED";
        String notifyMessage = "Bàn " + tableId + " đã cập nhật trạng thái.";

        if (status.name().equals("REQUESTING_BILL") || status.name().equals("WAITING_PAYMENT") || status.name().equals("PAYMENT_REQUESTED")) {
            notifyType = "REQUEST_PAYMENT";
            notifyMessage = "Bàn " + tableId + " đang yêu cầu thanh toán!";
        } else if (isNewCallStaff) { 
            notifyType = "CALL_STAFF";
            notifyMessage = "Bàn " + tableId + " đang gọi nhân viên!";
        }

        // Gửi WebSocket sau khi lưu DB thành công
        sendSocketWithTransactionSync("/topic/staff/tables", tableId, notifyType, notifyMessage);
    }

    @Override
    @Transactional
    public void cancelOrderItemByCustomer(Long orderDetailId, String reason) {
        OrderDetail detail = orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết món ăn ID: " + orderDetailId));

        if (detail.getStatus() != StatusOrderDetail.ORDERED) {
            throw new RuntimeException("Không thể hủy món do Bếp đã nhận chế biến hoặc đã phục vụ!");
        }

        // LẤY SỐ LƯỢNG AN TOÀN
        int rawQty = detail.getQuantity() != null ? detail.getQuantity() : 0;
        if (rawQty <= 0) {
            log.warn("Cảnh báo: OrderDetail ID {} có số lượng không hợp lệ ({}), tự động điều chỉnh về 1", orderDetailId, rawQty);
            rawQty = 1;
        }
        final int qty = rawQty; 

        detail.setStatus(StatusOrderDetail.CANCELLED);
        if (reason != null && !reason.trim().isEmpty()) {
            String currentNote = detail.getNote() != null ? detail.getNote() + " | " : "";
            detail.setNote(currentNote + "Khách hủy: " + reason);
        }
        orderDetailRepository.save(detail);

        // Cập nhật lại số lượng đã bán của Item
        Item item = detail.getItem();
        if (item != null) {
            int currentCount = item.getTotalOrderCount() != null ? item.getTotalOrderCount() : 0;
            item.setTotalOrderCount(Math.max(0, currentCount - qty));
            itemRepository.save(item);
        }

        // Cập nhật lại tổng tiền hóa đơn
        TableOrder order = detail.getOrder();
        if (order != null) {
            BigDecimal price = getSafeUnitPrice(detail);
            BigDecimal itemTotal = price.multiply(BigDecimal.valueOf(qty)); 

            BigDecimal currentTotal = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
            order.setTotalAmount(currentTotal.subtract(itemTotal).max(BigDecimal.ZERO));
            tableOrderRepository.save(order);
            
            // BẮN THÔNG BÁO CHO NHÂN VIÊN/BẾP BIẾT KHÁCH VỪA HỦY MÓN
            String itemName = item != null ? item.getItemName() : "Món ăn";
            Long tableId = order.getTable() != null ? order.getTable().getTableId() : 0L;
            
            sendSocketWithTransactionSync(
                "/topic/staff/tables", 
                tableId, 
                "CUSTOMER_CANCELLED_ITEM", 
                "Khách ở bàn " + tableId + " vừa hủy món: " + itemName
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceDetailResponseDTO getInvoiceDetailForCustomer(Long orderId, Long customerId) {
        TableOrder order = tableOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn ID: " + orderId));

        List<OrderDetail> orderDetails = orderDetailRepository.findByOrderTableOrderId(orderId);

        List<InvoiceDetailResponseDTO.OrderItemDTO> itemDTOs = orderDetails.stream()
                .map(detail -> {
                    Item item = detail.getItem();
                    Long itemId = (item != null) ? item.getItemId() : null;
                    String itemName = (item != null) ? item.getItemName() : "Món đã ngưng bán";
                    String itemImage = (item != null) ? item.getImageUrl() : null;

                    Double unitPrice = (detail.getUnitPrice() != null) ? detail.getUnitPrice().doubleValue() : 0.0;
                    int quantity = (detail.getQuantity() != null) ? detail.getQuantity() : 0;

                    boolean hasFeedback = false;
                    if (customerId != null && itemId != null) {
                        hasFeedback = feedbackRepository
                                .existsByCustomerCustomerIdAndItemItemIdAndDeletedAtIsNull(customerId, itemId);
                    }

                    return InvoiceDetailResponseDTO.OrderItemDTO.builder()
                            .itemId(itemId)
                            .itemName(itemName)
                            .itemImage(itemImage)
                            .price(unitPrice)
                            .quantity(quantity)
                            .totalPrice(unitPrice * quantity)
                            .hasFeedback(hasFeedback)
                            .build();
                })
                .collect(Collectors.toList());

        LocalDateTime paidDateTime = order.getPaidAt() != null ? order.getPaidAt() : order.getCloseAt();

        return InvoiceDetailResponseDTO.builder()
                .orderId(order.getTableOrderId())
                .invoiceCode(String.format("#HD%04d", order.getTableOrderId()))
                .tableId(order.getTable() != null ? order.getTable().getTableId() : null)
                .tableName(order.getTable() != null ? order.getTable().getTableName() : "Mang về")
                .totalAmount(order.getTotalAmount() != null ? order.getTotalAmount().doubleValue() : 0.0)
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null)
                .paidAt(toDate(paidDateTime))
                .items(itemDTOs)
                .build();
    }

    // --- PRIVATE HELPER METHODS ---

    private BigDecimal getSafeUnitPrice(OrderDetail detail) {
        if (detail.getUnitPrice() != null) return detail.getUnitPrice();
        if (detail.getItem() != null && detail.getItem().getPrice() != null) return detail.getItem().getPrice();
        return BigDecimal.ZERO;
    }

    private Date toDate(LocalDateTime localDateTime) {
        if (localDateTime == null) return null;
        return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
    }

    // Hàm Helper hỗ trợ bắn WebSocket an toàn sau khi commit Database
    private void sendSocketWithTransactionSync(String destination, Long tableId, String type, String message) {
        Runnable sendTask = () -> {
            try {
                messagingTemplate.convertAndSend(destination, Map.of(
                    "tableId", tableId,
                    "type", type,
                    "message", message,
                    "timestamp", System.currentTimeMillis()
                ));
                log.info("Đã gửi WebSocket tới {}: {}", destination, message);
            } catch (Exception e) {
                log.error("Lỗi khi gửi WebSocket tới {}: {}", destination, e.getMessage());
            }
        };

        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    sendTask.run();
                }
            });
        } else {
            sendTask.run();
        }
    }
}