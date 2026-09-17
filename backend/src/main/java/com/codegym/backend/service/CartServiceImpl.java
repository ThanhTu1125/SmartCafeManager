package com.codegym.backend.service;

import com.codegym.backend.dto.CartItemResponse;
import com.codegym.backend.dto.CartResponseDTO;
import com.codegym.backend.entity.*;
import com.codegym.backend.enums.*;
import com.codegym.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class CartServiceImpl implements CartService {

    private final TablesRepository tablesRepository;
    private final TableOrderRepository tableOrderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ItemRepository itemRepository;

    @Override
    @Transactional
    public void addItemToCart(Long tableId, Long itemId, Integer quantity, String note) {
        if (quantity != null && quantity <= 0) {
            throw new IllegalArgumentException("Số lượng đặt món phải lớn hơn 0!");
        }

        Tables table = getTableEntity(tableId);
        validateTableNotCheckingOut(table);

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Món ăn không tồn tại với ID: " + itemId));

        TableOrder order = tableOrderRepository.findByTableTableIdAndStatus(table.getTableId(), StatusTableOrder.OPEN)
                .orElseGet(() -> {
                    table.setIsOccupied(true);
                    tablesRepository.save(table);

                    TableOrder newOrder = TableOrder.builder()
                            .table(table)
                            .openAt(LocalDateTime.now())
                            .totalAmount(BigDecimal.ZERO) 
                            .status(StatusTableOrder.OPEN)
                            .build();
                    return tableOrderRepository.save(newOrder);
                });

        List<OrderDetail> existingDetails = orderDetailRepository
                .findByOrderTableOrderIdAndItemItemIdAndStatus(order.getTableOrderId(), itemId, StatusOrderDetail.PENDING);

        int addQty = (quantity != null) ? quantity : 1;

        if (!existingDetails.isEmpty()) {
            OrderDetail detail = existingDetails.get(0);
            int currentQty = detail.getQuantity() != null ? detail.getQuantity() : 0;
            detail.setQuantity(currentQty + addQty);
            
            if (note != null && !note.trim().isEmpty()) {
                if (detail.getNote() != null && !detail.getNote().trim().isEmpty()) {
                    detail.setNote(detail.getNote().trim() + ", " + note.trim());
                } else {
                    detail.setNote(note.trim());
                }
            }
            orderDetailRepository.save(detail);
        } else {
            BigDecimal price = item.getPrice() != null ? item.getPrice() : BigDecimal.ZERO;
            OrderDetail newDetail = OrderDetail.builder()
                    .order(order)
                    .item(item)
                    .quantity(addQty)
                    .unitPrice(price)
                    .note(note != null ? note.trim() : null)
                    .status(StatusOrderDetail.PENDING)
                    .build();

            orderDetailRepository.save(newDetail);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponseDTO getCartOverview(Long tableId) {
        Tables table = getTableEntity(tableId);
        TableOrder order = tableOrderRepository.findByTableTableIdAndStatus(table.getTableId(), StatusTableOrder.OPEN)
                .orElse(null);

        if (order == null) {
            return CartResponseDTO.builder()
                    .tableId(table.getTableId())
                    .tableName(table.getTableName())
                    .currentTotalAmount(BigDecimal.ZERO)
                    .orderedItems(List.of())
                    .pendingItems(List.of())
                    .build();
        }

        List<OrderDetail> allDetails = orderDetailRepository.findByOrderTableOrderId(order.getTableOrderId());
        List<CartItemResponse> pendingItems = new ArrayList<>();
        List<CartItemResponse> orderedItems = new ArrayList<>();
        BigDecimal calculatedTotal = BigDecimal.ZERO;

        for (OrderDetail detail : allDetails) {
            BigDecimal price = getSafeUnitPrice(detail);
            int qty = detail.getQuantity() != null ? detail.getQuantity() : 0;
            BigDecimal itemTotal = price.multiply(BigDecimal.valueOf(qty));

            if (detail.getStatus() == StatusOrderDetail.PENDING) {
                pendingItems.add(mapToCartItemResponse(detail));
                calculatedTotal = calculatedTotal.add(itemTotal);
            } else if (detail.getStatus() != StatusOrderDetail.CANCELLED) {
                orderedItems.add(mapToCartItemResponse(detail));
                calculatedTotal = calculatedTotal.add(itemTotal);
            }
        }

        return CartResponseDTO.builder()
                .tableOrderId(order.getTableOrderId())
                .tableId(table.getTableId())
                .tableName(table.getTableName())
                .currentTotalAmount(calculatedTotal)
                .orderedItems(orderedItems)
                .pendingItems(pendingItems)
                .build();
    }

    @Override
    @Transactional
    public void updateCartItemDetail(Long tableId, Long itemId, Integer newQuantity, String newNote) {
        Tables table = getTableEntity(tableId);
        validateTableNotCheckingOut(table);

        TableOrder order = getOpenOrder(table.getTableId());

        List<OrderDetail> existingDetails = orderDetailRepository
                .findByOrderTableOrderIdAndItemItemIdAndStatus(order.getTableOrderId(), itemId, StatusOrderDetail.PENDING);

        if (existingDetails.isEmpty()) {
            throw new RuntimeException("Món ăn không tồn tại trong giỏ tạm!");
        }

        OrderDetail detail = existingDetails.get(0);
        if (newQuantity != null && newQuantity > 0) {
            detail.setQuantity(newQuantity);
        }
        if (newNote != null) {
            detail.setNote(newNote.trim());
        }

        orderDetailRepository.save(detail);
    }

    @Override
    @Transactional
    public void removeItemFromCart(Long tableId, Long itemId) {
        Tables table = getTableEntity(tableId);
        validateTableNotCheckingOut(table);

        TableOrder order = getOpenOrder(table.getTableId());

        List<OrderDetail> existingDetails = orderDetailRepository
                .findByOrderTableOrderIdAndItemItemIdAndStatus(order.getTableOrderId(), itemId, StatusOrderDetail.PENDING);

        if (!existingDetails.isEmpty()) {
            orderDetailRepository.delete(existingDetails.get(0));
        }
    }

    @Override
    @Transactional
    public void clearTemporaryCart(Long tableId) {
        Tables table = getTableEntity(tableId);
        validateTableNotCheckingOut(table);

        TableOrder order = getOpenOrder(table.getTableId());

        List<OrderDetail> pendingDetails = orderDetailRepository
                .findByOrderTableOrderIdAndStatus(order.getTableOrderId(), StatusOrderDetail.PENDING);

        if (!pendingDetails.isEmpty()) {
            orderDetailRepository.deleteAllInBatch(pendingDetails);
        }
    }

    @Override
    @Transactional
    public void confirmOrder(Long tableId) {
        Tables table = getTableEntity(tableId);
        validateTableNotCheckingOut(table);

        TableOrder order = getOpenOrder(table.getTableId());

        List<OrderDetail> details = orderDetailRepository.findByOrderTableOrderId(order.getTableOrderId());
        boolean hasPending = details.stream().anyMatch(d -> d.getStatus() == StatusOrderDetail.PENDING);

        if (!hasPending) {
            throw new RuntimeException("Không có món mới nào trong giỏ hàng tạm!");
        }

        processPendingToOrderedAndRecalculateTotal(order, details);

        table.setServiceStatus(ServiceStatus.WAITING_FOOD);
        tablesRepository.save(table);
    }

    // --- PRIVATE HELPER METHODS ---

    /**
     * Kiểm tra xem bàn có đang trong quá trình yêu cầu thanh toán hay không.
     */
    private void validateTableNotCheckingOut(Tables table) {
        if (table.getServiceStatus() == ServiceStatus.REQUESTING_BILL) {
            throw new RuntimeException("Bàn đang chờ thanh toán, không thể thực hiện thao tác giỏ hàng!");
        }

        boolean isWaitingPayment = tableOrderRepository
                .findByTableTableIdAndStatus(table.getTableId(), StatusTableOrder.WAITING_PAYMENT)
                .isPresent();

        if (isWaitingPayment) {
            throw new RuntimeException("Hóa đơn đã được chốt, không thể thay đổi giỏ hàng!");
        }
    }

    private Tables getTableEntity(Long tableId) {
        return tablesRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Bàn không tồn tại với ID: " + tableId));
    }

    private TableOrder getOpenOrder(Long tableId) {
        return tableOrderRepository.findByTableTableIdAndStatus(tableId, StatusTableOrder.OPEN)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn đang mở cho bàn ID: " + tableId));
    }

    private BigDecimal getSafeUnitPrice(OrderDetail detail) {
        if (detail.getUnitPrice() != null) return detail.getUnitPrice();
        if (detail.getItem() != null && detail.getItem().getPrice() != null) return detail.getItem().getPrice();
        return BigDecimal.ZERO;
    }

    private void processPendingToOrderedAndRecalculateTotal(TableOrder order, List<OrderDetail> details) {
        BigDecimal totalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;

        for (OrderDetail detail : details) {
            if (detail.getStatus() == StatusOrderDetail.PENDING) {
                detail.setStatus(StatusOrderDetail.ORDERED);
                orderDetailRepository.save(detail);

                Item item = detail.getItem();
                if (item != null) {
                    int currentCount = item.getTotalOrderCount() != null ? item.getTotalOrderCount() : 0;
                    int qty = detail.getQuantity() != null ? detail.getQuantity() : 0;
                    item.setTotalOrderCount(currentCount + qty);
                    itemRepository.save(item);
                }

                BigDecimal price = getSafeUnitPrice(detail);
                int qty = detail.getQuantity() != null ? detail.getQuantity() : 0;
                totalAmount = totalAmount.add(price.multiply(BigDecimal.valueOf(qty)));
            }
        }
        order.setTotalAmount(totalAmount);
        tableOrderRepository.save(order);
    }

    private CartItemResponse mapToCartItemResponse(OrderDetail detail) {
        return CartItemResponse.builder()
                .orderDetailId(detail.getOrderDetailId())
                .itemId(detail.getItem() != null ? detail.getItem().getItemId() : null)
                .itemName(detail.getItem() != null ? detail.getItem().getItemName() : null)
                .price(getSafeUnitPrice(detail))
                .quantity(detail.getQuantity() != null ? detail.getQuantity() : 0)
                .note(detail.getNote())
                .status(detail.getStatus() != null ? detail.getStatus().name() : null)
                .tableName(detail.getOrder() != null && detail.getOrder().getTable() != null 
                        ? detail.getOrder().getTable().getTableName() : null)
                .build();
    }
}