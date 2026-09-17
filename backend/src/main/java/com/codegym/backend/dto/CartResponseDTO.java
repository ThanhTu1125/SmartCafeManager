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
public class CartResponseDTO {
    private Long tableOrderId;
    private Long tableId;
    private String tableName;
    private BigDecimal currentTotalAmount; // Tổng tiền các món đã gửi bếp
    
    // 1. Món đã gọi (Đã gửi bếp) -> Read-only
    private List<CartItemResponse> orderedItems; 
    
    // 2. Món trong giỏ tạm (Chưa gửi bếp) -> Cho phép chỉnh sửa (nằm phía dưới)
    private List<CartItemResponse> pendingItems; 
}