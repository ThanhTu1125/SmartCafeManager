package com.codegym.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TableEventDTO {
    private String type;
    private String message;
    private Long tableId;
}