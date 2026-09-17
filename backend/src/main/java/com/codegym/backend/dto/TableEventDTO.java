package com.codegym.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TableEventDTO {
    private String type;      // NEW_ORDER_SUBMITTED, CALL_STAFF, PAYMENT_REQUESTED, TABLE_CLEARED, ORDER_CONFIRMED, ALL_ITEMS_SERVED
    private String message;   // Nội dung hiển thị ở chuông/toast
    private Long tableId;     // ID bàn tác động
}