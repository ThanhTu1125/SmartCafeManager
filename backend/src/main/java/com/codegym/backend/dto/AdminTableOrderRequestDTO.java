package com.codegym.backend.dto;

import com.codegym.backend.enums.PaymentMethod;
import com.codegym.backend.enums.StatusTableOrder;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AdminTableOrderRequestDTO {
    private Long tableId;
    private Long customerId;
    private Long employeeId;
    private BigDecimal totalAmount;
    private PaymentMethod paymentMethod;
    private StatusTableOrder status;
    private String cancelReason;
}