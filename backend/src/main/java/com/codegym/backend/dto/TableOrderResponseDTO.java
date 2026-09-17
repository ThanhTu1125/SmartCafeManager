package com.codegym.backend.dto;

import com.codegym.backend.enums.StatusTableOrder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TableOrderResponseDTO {
    private Long tableOrderId;
    private BigDecimal totalAmount;
    private StatusTableOrder status;
    private String paymentMethod;
    private String cancelReason;
    private Boolean isDeleted;

    // Các mốc thời gian & Audit log
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
    private LocalDateTime openAt;
    private LocalDateTime closeAt;
    private LocalDateTime paidAt;

    // Phẳng hóa thông tin Bàn, Khách hàng, Nhân viên
    private Long tableId;
    private String tableName;
    private Long customerId;
    private String customerName;
    private Long employeeId;
    private String employeeName;

    // Danh sách món trong đơn
    private List<OrderDetailResponseDTO> items;
}