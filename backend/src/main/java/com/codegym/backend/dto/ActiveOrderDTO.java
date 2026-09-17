package com.codegym.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActiveOrderDTO {
    private Long tableId;
    private String tableName;
    private String serviceStatus;
    private boolean hasActiveOrder;
    private Long tableOrderId;
    private String orderTime;
    private BigDecimal totalAmount;
    private List<OrderItemDto> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDto {
        private Long orderDetailId;
        private String itemName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subTotal;
        private String status;
        private String note;
    }
}