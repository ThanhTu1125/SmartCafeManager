package com.codegym.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.codegym.backend.dto.TableOrderSummaryDTO.OrderDetailDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableOrderInvoiceDTO {
    private Long tableOrderId;
    private String tableName;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private List<OrderDetailDTO> items;
}