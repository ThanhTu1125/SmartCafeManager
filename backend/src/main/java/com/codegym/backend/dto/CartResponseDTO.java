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
    private BigDecimal currentTotalAmount;
    
    private List<CartItemResponse> orderedItems; 
    
    private List<CartItemResponse> pendingItems; 
}