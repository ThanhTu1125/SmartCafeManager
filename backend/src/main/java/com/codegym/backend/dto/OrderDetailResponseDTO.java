package com.codegym.backend.dto;

import com.codegym.backend.enums.StatusOrderDetail;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailResponseDTO {

    private Long orderDetailId;
    private Long itemId;
    private String itemCode;  // THÊM TRƯỜNG NÀY
    private String itemName;
    private String itemImage; // GIỮ NGUYÊN TRƯỜNG CỦ CỦA BẠN
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String note;
    private StatusOrderDetail status;
}