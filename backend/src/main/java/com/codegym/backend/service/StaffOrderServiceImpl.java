package com.codegym.backend.service;

import com.codegym.backend.dto.ActiveOrderDTO;
import com.codegym.backend.dto.OrderDetailResponseDTO;
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
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class StaffOrderServiceImpl implements StaffOrderService {

    private final TablesRepository tablesRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final TableOrderRepository tableOrderRepository;
    private final PaymentService paymentService;
    private final SimpMessagingTemplate messagingTemplate;
    private final com.codegym.backend.repository.ItemRepository itemRepository;

    private static final List<StatusTableOrder> ACTIVE_ORDER_STATUSES = List.of(
            StatusTableOrder.OPEN,
            StatusTableOrder.WAITING_PAYMENT);

    // ==========================================
    // I. SƠ ĐỒ BÀN & CHI TIẾT PANELS
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<Tables> getAllTables() {
        return tablesRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Tables getTableInfo(Long tableId) {
        return tablesRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin bàn ID: " + tableId));
    }

    @Override
    @Transactional(readOnly = true)
    public ActiveOrderDTO getActiveOrderByTable(Long tableId) {
        Tables table = getTableInfo(tableId);

        TableOrder activeOrder = tableOrderRepository
                .findByTableTableIdAndStatusIn(tableId, ACTIVE_ORDER_STATUSES)
                .orElse(null);

        if (activeOrder == null) {
            return ActiveOrderDTO.builder()
                    .tableId(table.getTableId())
                    .tableName(table.getTableName())
                    .serviceStatus(table.getServiceStatus() != null ? table.getServiceStatus().name() : null)
                    .hasActiveOrder(false)
                    .build();
        }

        List<OrderDetail> details = orderDetailRepository.findByOrderTableOrderId(activeOrder.getTableOrderId());

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        String formattedTime = activeOrder.getOpenAt() != null
                ? activeOrder.getOpenAt().format(timeFormatter)
                : "";

        List<ActiveOrderDTO.OrderItemDto> itemDtos = details.stream().map(detail -> {
            int qty = detail.getQuantity() != null ? detail.getQuantity() : 0;
            BigDecimal price = detail.getUnitPrice() != null ? detail.getUnitPrice() : BigDecimal.ZERO;

            return ActiveOrderDTO.OrderItemDto.builder()
                    .orderDetailId(detail.getOrderDetailId())
                    .itemName(detail.getItem() != null ? detail.getItem().getItemName() : "Món không xác định")
                    .quantity(qty)
                    .unitPrice(price)
                    .subTotal(price.multiply(BigDecimal.valueOf(qty)))
                    .status(detail.getStatus() != null ? detail.getStatus().name() : null)
                    .note(detail.getNote())
                    .build();
        }).collect(Collectors.toList());

        return ActiveOrderDTO.builder()
                .tableId(table.getTableId())
                .tableName(table.getTableName())
                .serviceStatus(table.getServiceStatus() != null ? table.getServiceStatus().name() : null)
                .hasActiveOrder(true)
                .tableOrderId(activeOrder.getTableOrderId())
                .orderTime(formattedTime)
                .totalAmount(activeOrder.getTotalAmount() != null ? activeOrder.getTotalAmount() : BigDecimal.ZERO)
                .items(itemDtos)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDetailResponseDTO> getOrderDetailsByTable(Long tableId) {
        TableOrder activeOrder = tableOrderRepository
                .findByTableTableIdAndStatusIn(tableId, ACTIVE_ORDER_STATUSES)
                .orElseThrow(() -> new RuntimeException("Bàn hiện tại không có đơn hàng active!"));

        List<OrderDetail> details = orderDetailRepository.findByOrderTableOrderId(activeOrder.getTableOrderId());

        return details.stream().map(item -> {
            int qty = item.getQuantity() != null ? item.getQuantity() : 0;
            BigDecimal unitPrice = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;
            BigDecimal total = unitPrice.multiply(BigDecimal.valueOf(qty));

            return OrderDetailResponseDTO.builder()
                    .orderDetailId(item.getOrderDetailId())
                    .itemId(item.getItem() != null ? item.getItem().getItemId() : null)
                    .itemName(item.getItem() != null ? item.getItem().getItemName() : "Món không xác định")
                    .itemImage(item.getItem() != null ? item.getItem().getImageUrl() : null)
                    .quantity(qty)
                    .unitPrice(unitPrice)
                    .totalPrice(total)
                    .note(item.getNote())
                    .status(item.getStatus())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void approveCashPayment(Long tableId) {
        paymentService.completeCheckout(tableId, PaymentMethod.CASH);
        notifyCustomerTable(tableId, "PAYMENT_SUCCESS", "Thanh toán thành công! Cảm ơn quý khách.");
    }

    @Override
    @Transactional
    public void cancelTableOrder(Long tableId, String reason) {
        TableOrder activeOrder = tableOrderRepository.findByTableTableIdAndStatusIn(tableId, ACTIVE_ORDER_STATUSES)
                .orElseThrow(() -> new RuntimeException("Bàn không có hóa đơn nào đang mở để hủy!"));

        activeOrder.setStatus(StatusTableOrder.CANCELLED);
        tableOrderRepository.save(activeOrder);

        List<OrderDetail> details = orderDetailRepository.findByOrderTableOrderId(activeOrder.getTableOrderId());
        for (OrderDetail detail : details) {
            detail.setStatus(StatusOrderDetail.CANCELLED);
            detail.setNote("Hủy đơn: " + reason);
        }
        orderDetailRepository.saveAll(details);

        Tables table = activeOrder.getTable();
        table.setServiceStatus(ServiceStatus.EMPTY);
        table.setIsOccupied(false);
        tablesRepository.save(table);

        notifyCustomerTable(tableId, "ORDER_CANCELLED", "Hóa đơn đã bị hủy bởi nhân viên. Lý do: " + reason);
        notifyStaffAndKitchen(tableId, "TABLE_CLEARED", "Hóa đơn bàn " + tableId + " đã bị hủy.");
    }

    @Override
    @Transactional
    public void updateTableServiceStatus(Long tableId, ServiceStatus status) {
        Tables table = getTableInfo(tableId);
        table.setServiceStatus(status);
        tablesRepository.save(table);

        notifyStaffAndKitchen(tableId, "TABLE_STATUS_CHANGED", "Bàn " + tableId + " đổi trạng thái sang " + status);

        if (status == ServiceStatus.SERVING || status == ServiceStatus.NORMAL || status == ServiceStatus.WAITING_FOOD) {
            notifyCustomerTable(tableId, "STAFF_ACKNOWLEDGED",
                    "Nhân viên đã tiếp nhận yêu cầu và đang ra bàn của bạn.");
        }
    }

    @Override
    @Transactional
    public void serveAllItemsByTable(Long tableId) {
        TableOrder order = tableOrderRepository.findByTableTableIdAndStatusIn(tableId, ACTIVE_ORDER_STATUSES)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng đang mở của bàn ID: " + tableId));

        List<OrderDetail> details = orderDetailRepository.findByOrderTableOrderId(order.getTableOrderId());

        List<OrderDetail> pendingDetails = details.stream()
                .filter(d -> d.getStatus() == StatusOrderDetail.ORDERED || d.getStatus() == StatusOrderDetail.CONFIRMED)
                .collect(Collectors.toList());

        if (pendingDetails.isEmpty()) {
            throw new RuntimeException("Không có món nào mới cần phục vụ!");
        }

        for (OrderDetail detail : pendingDetails) {
            detail.setStatus(StatusOrderDetail.SERVED);
        }
        orderDetailRepository.saveAll(pendingDetails);

        Tables table = order.getTable();
        table.setServiceStatus(ServiceStatus.SERVING);
        tablesRepository.save(table);

        notifyCustomerTable(tableId, "ALL_ITEMS_SERVED", "Tất cả món ăn lượt này đã được phục vụ!");
        notifyStaffAndKitchen(tableId, "ALL_ITEMS_SERVED", "Bàn " + tableId + " đã hoàn tất phục vụ món lượt này.");
    }

    @Override
    @Transactional
    public void confirmAllNewItemsByTable(Long tableId) {
        TableOrder order = tableOrderRepository.findByTableTableIdAndStatusIn(tableId, ACTIVE_ORDER_STATUSES)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng đang mở của bàn ID: " + tableId));

        List<OrderDetail> details = orderDetailRepository.findByOrderTableOrderId(order.getTableOrderId());

        List<OrderDetail> orderedDetails = details.stream()
                .filter(d -> d.getStatus() == StatusOrderDetail.ORDERED)
                .collect(Collectors.toList());

        if (orderedDetails.isEmpty()) {
            throw new RuntimeException("Không có món mới nào cần nhận đơn!");
        }

        for (OrderDetail detail : orderedDetails) {
            detail.setStatus(StatusOrderDetail.CONFIRMED);
        }
        orderDetailRepository.saveAll(orderedDetails);

        notifyCustomerTable(tableId, "ORDER_CONFIRMED", "Đơn hàng mới của bạn đã được bếp tiếp nhận!");
        notifyStaffAndKitchen(tableId, "ORDER_CONFIRMED", "Bàn " + tableId + " đã được xác nhận đơn lượt mới.");
    }

    // ==========================================
    // IV. THAO TÁC CHI TIẾT TỪNG MÓN LẺ
    // ==========================================

    @Override
    @Transactional
    public void confirmOrderItems(Long tableOrderId) {
        List<OrderDetail> details = orderDetailRepository.findByOrderTableOrderId(tableOrderId);
        if (details.isEmpty()) {
            throw new RuntimeException("Đơn hàng không có món nào!");
        }

        Long tableId = details.get(0).getOrder().getTable().getTableId();

        for (OrderDetail detail : details) {
            if (detail.getStatus() == StatusOrderDetail.ORDERED) {
                detail.setStatus(StatusOrderDetail.CONFIRMED);
            }
        }
        orderDetailRepository.saveAll(details);

        notifyCustomerTable(tableId, "ORDER_CONFIRMED", "Đơn hàng của bạn đã được bếp xác nhận và đang chế biến.");
        notifyStaffAndKitchen(tableId, "ORDER_CONFIRMED", "Bàn " + tableId + " đã được xác nhận đơn món.");
    }

    @Override
    @Transactional
    public void markItemAsServed(Long orderDetailId) {
        OrderDetail detail = orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết đơn hàng!"));

        detail.setStatus(StatusOrderDetail.SERVED);
        orderDetailRepository.save(detail);

        Long tableId = detail.getOrder().getTable().getTableId();
        String itemName = detail.getItem() != null ? detail.getItem().getItemName() : "Món ăn";

        notifyCustomerTable(tableId, "ITEM_SERVED", "Món '" + itemName + "' đã được phục vụ lên bàn.");
    }

    @Override
    @Transactional
    public void cancelOrderItem(Long orderDetailId, String reason) {
        OrderDetail detail = orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết đơn hàng!"));

        String cancelReason = (reason != null && !reason.trim().isEmpty()) ? reason : "Hết món / Hết nguyên liệu";
        detail.setStatus(StatusOrderDetail.CANCELLED);
        detail.setNote("Đã hủy: " + cancelReason);
        orderDetailRepository.save(detail);

        int qtyToReduce = detail.getQuantity() != null ? detail.getQuantity() : 0;
        updateItemTotalOrderCount(detail.getItem(), -qtyToReduce);

        TableOrder order = detail.getOrder();
        recalculateOrderTotal(order);

        Long tableId = order.getTable().getTableId();
        String itemName = detail.getItem() != null ? detail.getItem().getItemName() : "Món ăn";

        notifyCustomerTable(tableId, "ITEM_CANCELLED", "Món '" + itemName + "' bị hủy do: " + cancelReason);
    }

    @Override
    @Transactional
    public void updateOrderItem(Long orderDetailId, Integer newQuantity, String newNote) {
        OrderDetail detail = orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết đơn hàng!"));

        if (newQuantity == null || newQuantity <= 0) {
            deleteOrderItem(orderDetailId);
            return;
        }

        int currentQty = detail.getQuantity() != null ? detail.getQuantity() : 0;
        int diff = newQuantity - currentQty;
        updateItemTotalOrderCount(detail.getItem(), diff);

        detail.setQuantity(newQuantity);
        if (newNote != null) {
            detail.setNote(newNote);
        }
        orderDetailRepository.save(detail);

        TableOrder order = detail.getOrder();
        recalculateOrderTotal(order);

        Long tableId = order.getTable().getTableId();
        String itemName = detail.getItem() != null ? detail.getItem().getItemName() : "Món ăn";

        // 1. Thông báo cho máy của khách hàng
        notifyCustomerTable(tableId, "ITEM_UPDATED",
                "Món '" + itemName + "' đã được cập nhật số lượng thành " + newQuantity);

        // 2. Thông báo cho Bếp và các màn hình Nhân viên khác đồng bộ
        notifyStaffAndKitchen(tableId, "ITEM_UPDATED",
                "Bàn " + tableId + " vừa cập nhật món '" + itemName + "' (" + newQuantity + ")");
    }

    @Override
    @Transactional
    public void deleteOrderItem(Long orderDetailId) {
        OrderDetail detail = orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết đơn hàng!"));

        TableOrder order = detail.getOrder();
        String itemName = detail.getItem() != null ? detail.getItem().getItemName() : "Món ăn";
        Long tableId = order.getTable().getTableId();
        
        int qtyToReduce = detail.getQuantity() != null ? detail.getQuantity() : 0;
        updateItemTotalOrderCount(detail.getItem(), -qtyToReduce);

        orderDetailRepository.delete(detail);
        orderDetailRepository.flush();

        recalculateOrderTotal(order);

        notifyCustomerTable(tableId, "ITEM_DELETED", "Món '" + itemName + "' đã được bỏ khỏi đơn hàng.");
        notifyStaffAndKitchen(tableId, "ITEM_DELETED", "Bàn " + tableId + " vừa bỏ món '" + itemName + "' khỏi đơn.");
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private void recalculateOrderTotal(TableOrder order) {
        List<OrderDetail> details = orderDetailRepository.findByOrderTableOrderId(order.getTableOrderId());

        BigDecimal newTotal = details.stream()
                .filter(d -> d.getStatus() == StatusOrderDetail.ORDERED
                        || d.getStatus() == StatusOrderDetail.CONFIRMED
                        || d.getStatus() == StatusOrderDetail.SERVED)
                .map(d -> {
                    BigDecimal price = d.getUnitPrice() != null ? d.getUnitPrice() : BigDecimal.ZERO;
                    int qty = d.getQuantity() != null ? d.getQuantity() : 0;
                    return price.multiply(BigDecimal.valueOf(qty));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalAmount(newTotal);
        tableOrderRepository.save(order);
    }

    private void notifyCustomerTable(Long tableId, String type, String message) {
        sendSocketWithTransactionSync("/topic/tables/" + tableId, tableId, type, message);
    }

    private void notifyStaffAndKitchen(Long tableId, String type, String message) {
        sendSocketWithTransactionSync("/topic/table-events", tableId, type, message);
    }

    private void sendSocketWithTransactionSync(String destination, Long tableId, String type, String message) {
        Runnable sendTask = () -> {
            try {
                Map<String, Object> payload = new HashMap<>();
                payload.put("tableId", tableId);
                payload.put("type", type);
                payload.put("message", message);
                payload.put("timestamp", System.currentTimeMillis());

                messagingTemplate.convertAndSend(destination, payload);
            } catch (Exception e) {
                log.error("Lỗi gửi WebSocket tới {}: {}", destination, e.getMessage());
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

    private void updateItemTotalOrderCount(com.codegym.backend.entity.Item item, int quantityChange) {
        if (item != null && quantityChange != 0) {
            int currentCount = item.getTotalOrderCount() != null ? item.getTotalOrderCount() : 0;
            int newCount = Math.max(0, currentCount + quantityChange);
            item.setTotalOrderCount(newCount);
            itemRepository.save(item);
        }
    }
}