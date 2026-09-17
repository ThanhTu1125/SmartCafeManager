package com.codegym.backend.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {
    private Long orderDetailId;
    private Long itemId;
    private String itemName;
    private BigDecimal price;
    private Integer quantity;
    private String tableName;
    private String note;
    private String status;
}