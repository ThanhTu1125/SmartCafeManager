package com.codegym.backend.dto;

import com.codegym.backend.enums.StatusTableOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDetailResponseDTO {
    private Long orderId;
    private String invoiceCode;
    private Long tableId;
    private String tableName;
    private Double totalAmount;
    private Date createdAt;
    private Date openAt;
    private Date paidAt;
    private StatusTableOrder status;
    private String paymentMethod;
    private List<OrderItemDTO> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDTO {
        private Long itemId;
        private String itemName;
        private String itemImage;
        private Integer quantity;
        private Double price;
        private Double totalPrice;
        private Boolean hasFeedback; // Phục vụ luồng đánh giá món của Khách hàng
    }
}