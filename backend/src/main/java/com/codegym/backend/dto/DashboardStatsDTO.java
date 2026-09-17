package com.codegym.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    // 3 thẻ Tổng quan phía trên
    private Double todayRevenue;      // Tổng doanh thu hôm nay
    private Long todayOrderCount;     // Tổng hóa đơn trong ngày
    private Double monthRevenue;      // Doanh thu tháng này

    // Dữ liệu cho Biểu đồ đường (Doanh thu theo tuần)
    private List<WeeklyRevenueDTO> weeklyRevenue;

    // Dữ liệu cho Biểu đồ tròn (Tỷ lệ bán theo danh mục)
    private List<CategorySalesDTO> categorySales;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class WeeklyRevenueDTO {
        private String dayOfWeek;     // "Thứ 2", "Thứ 3", ... "Chủ nhật"
        private Double revenue;       // Doanh thu của ngày đó
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategorySalesDTO {
        private String categoryName;  // Cà phê, Trà sữa & Trà, Bánh ngọt...
        private Long totalQuantity;   // Số lượng bán hoặc Tỷ lệ %
    }
}