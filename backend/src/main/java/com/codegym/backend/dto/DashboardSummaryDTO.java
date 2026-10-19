package com.codegym.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDTO {
    private Double todayRevenue;
    private Long todayOrderCount;
    private Double monthlyRevenue;
}