package com.codegym.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemResponseDTO {

    private Long itemId;
    private String itemCode;
    private String itemName;
    private String description;
    private String imageUrl;
    private BigDecimal price;
    private Boolean isAvailable;
    private Integer totalOrderCount;
    private Long categoryId;
    private String categoryName;
}