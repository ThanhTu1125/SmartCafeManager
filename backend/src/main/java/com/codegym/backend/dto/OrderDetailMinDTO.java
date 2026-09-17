package com.codegym.backend.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailMinDTO {
    private Long orderDetailId;
    private Integer quantity;
    private BigDecimal unitPrice;
    private String note;
    private String status;
    private Long itemId;
    private String itemName;
    private String imageUrl;
}