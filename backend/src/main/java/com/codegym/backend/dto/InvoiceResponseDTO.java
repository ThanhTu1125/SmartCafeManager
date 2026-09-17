package com.codegym.backend.dto;

import com.codegym.backend.enums.StatusTableOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponseDTO {
    private Long orderId;
    private String invoiceCode;
    private Long tableId;
    private String tableName;
    private Double totalAmount;
    private Date createdAt;
    private Date openAt;
    private Date paidAt;
    private StatusTableOrder status;
    private String paymentMethod;
}