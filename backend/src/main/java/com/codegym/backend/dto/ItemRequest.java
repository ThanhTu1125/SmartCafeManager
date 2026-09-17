package com.codegym.backend.dto;

import java.math.BigDecimal;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.media.Schema; // Import thư viện Swagger Schema

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemRequest {
    private String itemCode;
    private Long categoryId;
    private String itemName;
    private BigDecimal price;
    private String description;
    @Schema(type = "string", format = "binary")
    private MultipartFile image;
}