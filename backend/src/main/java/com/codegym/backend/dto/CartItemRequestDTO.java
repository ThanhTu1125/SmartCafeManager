package com.codegym.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CartItemRequestDTO {
    @NotNull(message = "Bàn không được để trống")
    private Long tableId;

    @NotNull(message = "Món ăn không được để trống")
    private Long itemId;

    private Integer quantity = 1;
    private String note;
}