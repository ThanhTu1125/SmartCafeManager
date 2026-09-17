package com.codegym.backend.enums;

public enum StatusTableOrder {
    OPEN,            // Bàn mới mở, đang gọi món
    PROCESSING,      // Đã chốt đơn, bếp đang chế biến / đang phục vụ
    WAITING_PAYMENT, // chờ thu ngân thanh toán
    PAID,            // Đã thanh toán thành công
    COMPLETED,       // Hoàn tất lượt phục vụ (dọn bàn, đóng đơn)
    CANCELLED,       // Hủy đơn hàng (trước khi thanh toán)
    REFUNDED         // Hoàn tiền (sau khi đã thanh toán)
}