package com.codegym.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.codegym.backend.dto.TableOrderInvoiceDTO;
import com.codegym.backend.dto.TableOrderSummaryDTO;
import com.codegym.backend.dto.TableOrderSummaryDTO.OrderDetailDTO;
import com.codegym.backend.entity.OrderDetail;
import com.codegym.backend.entity.TableOrder;
import com.codegym.backend.entity.Tables;
import com.codegym.backend.enums.PaymentMethod;
import com.codegym.backend.enums.ServiceStatus;
import com.codegym.backend.enums.StatusOrderDetail;
import com.codegym.backend.enums.StatusTableOrder;
import com.codegym.backend.repository.OrderDetailRepository;
import com.codegym.backend.repository.TableOrderRepository;
import com.codegym.backend.repository.TablesRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null") 
public class PaymentServiceImpl implements PaymentService {

    private final TableOrderRepository tableOrderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final TablesRepository tablesRepository; 
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void processCashPayment(Long tableId) {
        requestCheckout(tableId, PaymentMethod.CASH);
    }

    @Override
    @Transactional
    public void requestCheckout(Long tableId, PaymentMethod paymentMethod) {
        TableOrder order = tableOrderRepository
                .findByTableTableIdAndStatusIn(tableId, List.of(StatusTableOrder.OPEN, StatusTableOrder.WAITING_PAYMENT))
                .orElseThrow(() -> new RuntimeException("Bàn " + tableId + " không có hóa đơn mở!"));

        List<OrderDetail> details = orderDetailRepository.findByOrder(order);
        if (details == null || details.isEmpty()) {
            throw new RuntimeException("Chưa có món ăn nào được gọi, không thể yêu cầu thanh toán!");
        }

        boolean hasValidItems = details.stream()
                .anyMatch(d -> d.getStatus() != StatusOrderDetail.CANCELLED);
        if (!hasValidItems) {
            throw new RuntimeException("Chưa có món ăn hợp lệ để thanh toán!");
        }

        order.setStatus(StatusTableOrder.WAITING_PAYMENT);
        order.setPaymentMethod(paymentMethod);
        tableOrderRepository.save(order);

        Tables table = order.getTable();
        if (table != null) {
            table.setServiceStatus(ServiceStatus.REQUESTING_BILL);
            tablesRepository.save(table);
        }

        // Bắn Socket event PAYMENT_REQUESTED
        notifyTableEvents(tableId, "PAYMENT_REQUESTED", "Bàn " + tableId + " yêu cầu thanh toán (" + paymentMethod + ")");
    }

    @Override
    @Transactional
    public void completeCheckout(Long tableId, PaymentMethod paymentMethod) {
        TableOrder order = tableOrderRepository
                .findByTableTableIdAndStatusIn(tableId, List.of(StatusTableOrder.OPEN, StatusTableOrder.WAITING_PAYMENT))
                .orElseThrow(() -> new RuntimeException("Bàn " + tableId + " không có hóa đơn chờ hoàn tất thanh toán!"));

        order.setStatus(StatusTableOrder.PAID);
        order.setPaymentMethod(paymentMethod != null ? paymentMethod : PaymentMethod.CASH);
        order.setPaidAt(LocalDateTime.now());
        order.setCloseAt(LocalDateTime.now());
        tableOrderRepository.save(order);

        List<OrderDetail> details = orderDetailRepository.findByOrder(order);
        if (details != null && !details.isEmpty()) {
            for (OrderDetail detail : details) {
                if (detail.getStatus() == StatusOrderDetail.ORDERED || 
                    detail.getStatus() == StatusOrderDetail.CONFIRMED) {
                    detail.setStatus(StatusOrderDetail.SERVED);
                }
            }
            orderDetailRepository.saveAll(details);
        }

        Tables table = order.getTable();
        if (table != null) {
            table.setServiceStatus(ServiceStatus.EMPTY);
            table.setIsOccupied(false);
            tablesRepository.save(table);
        }

        // Bắn Socket event TABLE_CLEARED
        notifyTableEvents(tableId, "TABLE_CLEARED", "Bàn " + tableId + " đã hoàn tất thanh toán và trống!");
    }

    @Override
    @Transactional(readOnly = true)
    public TableOrderSummaryDTO getInvoiceSummaryDTO(Long tableId) {
        TableOrder order = tableOrderRepository
                .findByTableTableIdAndStatusIn(tableId, List.of(StatusTableOrder.OPEN, StatusTableOrder.WAITING_PAYMENT))
                .orElseThrow(() -> new RuntimeException("Bàn " + tableId + " không có hóa đơn mở hoặc chờ thanh toán!"));

        BigDecimal total = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
        List<OrderDetail> details = orderDetailRepository.findByOrder(order);

        return TableOrderSummaryDTO.builder()
                .tableOrderId(order.getTableOrderId())
                .tableId(tableId)
                .tableName(order.getTable() != null ? order.getTable().getTableName() : "Bàn " + tableId)
                .totalAmount(total)
                .orderStatus(order.getStatus() != null ? order.getStatus().name() : null)
                .openAt(order.getOpenAt())
                .orderDetails(mapToOrderDetailDTOList(details))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TableOrderInvoiceDTO getCurrentInvoice(Long tableId, Long tableOrderId) {
        TableOrder order;

        if (tableOrderId != null) {
            order = tableOrderRepository.findById(tableOrderId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn mã: " + tableOrderId));
        } else {
            order = tableOrderRepository
                    .findByTableTableIdAndStatusIn(tableId, List.of(StatusTableOrder.OPEN, StatusTableOrder.WAITING_PAYMENT))
                    .orElseThrow(() -> new RuntimeException("Bàn " + tableId + " không có hóa đơn mở hoặc chờ thanh toán!"));
        }

        List<OrderDetail> details = orderDetailRepository.findByOrder(order);
        List<OrderDetailDTO> itemDTOs = mapToOrderDetailDTOList(details);
        BigDecimal finalTotal = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;

        return TableOrderInvoiceDTO.builder()
                .tableOrderId(order.getTableOrderId())
                .tableName(order.getTable() != null ? order.getTable().getTableName() : null)
                .totalAmount(finalTotal)
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null)
                .status(order.getStatus() != null ? order.getStatus().name() : null)
                .createdAt(order.getOpenAt())
                .paidAt(order.getPaidAt())
                .items(itemDTOs)
                .build();
    }

    private List<OrderDetailDTO> mapToOrderDetailDTOList(List<OrderDetail> details) {
        if (details == null || details.isEmpty()) {
            return Collections.emptyList();
        }

        return details.stream()
                .map(detail -> {
                    BigDecimal priceBD = detail.getUnitPrice() != null ? detail.getUnitPrice() : BigDecimal.ZERO;

                    return OrderDetailDTO.builder()
                            .orderDetailId(detail.getOrderDetailId())
                            .itemName(detail.getItem() != null ? detail.getItem().getItemName() : "Món ăn")
                            .unitPrice(priceBD.longValue())
                            .quantity(detail.getQuantity() != null ? detail.getQuantity() : 0)
                            .note(detail.getNote())
                            .status(detail.getStatus() != null ? detail.getStatus().name() : null)
                            .itemId(detail.getItem() != null ? detail.getItem().getItemId() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private void notifyTableEvents(Long tableId, String type, String message) {
        Runnable sendTask = () -> {
            try {
                Map<String, Object> payload = Map.of(
                    "tableId", tableId,
                    "type", type,
                    "message", message,
                    "timestamp", System.currentTimeMillis()
                );
                messagingTemplate.convertAndSend("/topic/table-events", payload);
            } catch (Exception e) {
                log.error("Lỗi bắn WebSocket tại PaymentService cho bàn {}: {}", tableId, e.getMessage());
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