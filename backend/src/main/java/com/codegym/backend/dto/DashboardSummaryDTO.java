package com.codegym.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDTO {
    private Double todayRevenue;     // Tổng doanh thu hôm nay
    private Long todayOrderCount;    // Tổng hóa đơn trong ngày
    private Double monthlyRevenue;   // Doanh thu tháng này
}