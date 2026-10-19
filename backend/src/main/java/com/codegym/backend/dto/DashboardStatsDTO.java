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
    private Double todayRevenue;
    private Long todayOrderCount;
    private Double monthRevenue;

    private List<WeeklyRevenueDTO> weeklyRevenue;

    private List<CategorySalesDTO> categorySales;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class WeeklyRevenueDTO {
        private String dayOfWeek;
        private Double revenue;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategorySalesDTO {
        private String categoryName;
        private Long totalQuantity;
    }
}