package com.codegym.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableOrderSummaryDTO {
    private Long tableOrderId;
    private Long tableId;
    private String tableName;
    private BigDecimal totalAmount;
    private String orderStatus;
    private String serviceStatus;
    private LocalDateTime openAt;
    private List<OrderDetailDTO> orderDetails;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderDetailDTO {
        private Long orderDetailId;
        private Integer quantity;
        private Long unitPrice;
        private String note;
        private String status;
        private Long itemId;
        private String itemName;
        private String imageUrl;
    }
}