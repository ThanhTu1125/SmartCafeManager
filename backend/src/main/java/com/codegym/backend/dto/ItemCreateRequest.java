package com.codegym.backend.dto;

import java.math.BigDecimal;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemCreateRequest {

    @NotBlank(message = "Mã món ăn không được để trống")
    private String itemCode;

    @NotBlank(message = "Tên món ăn không được để trống")
    private String itemName;

    @NotNull(message = "Giá món ăn không được để trống")
    @Positive(message = "Giá món ăn phải lớn hơn 0")
    private BigDecimal price;

    private String description;
    private Long categoryId;
    private String newCategoryName;
    private MultipartFile image;
}