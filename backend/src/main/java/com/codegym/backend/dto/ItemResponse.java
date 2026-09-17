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
public class ItemResponse {
    private Long itemId;
    private String itemCode;
    
    private Long categoryId;
    private String categoryName;
    
    private String itemName;
    private BigDecimal price;
    private String description;
    private String imageUrl;
    private Boolean isAvailable;
    private Integer totalOrderCount;
}