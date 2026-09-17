package com.codegym.backend.enums;

public enum ServiceStatus {
    NORMAL,
    EMPTY,            // 1. Trắng: Bàn trống
    WAITING_FOOD,     // 2. Vàng/Cam: Bàn chờ bếp làm món (khi khách confirm order)
    SERVING,          // 3. Xanh lá: Bàn đang phục vụ bình thường
    CALL_STAFF,       // 4. Xanh dương: Khách nhấn nút "Gọi nhân viên"
    REQUESTING_BILL,  // 5. Hồng: Khách nhấn nút "Chờ tính tiền"
    WAITING_PAYMENT   // (Tùy chọn) Nhân viên đang xử lý in hóa đơn
}