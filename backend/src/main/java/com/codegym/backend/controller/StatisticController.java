package com.codegym.backend.controller;

import com.codegym.backend.dto.DashboardStatsDTO;
import com.codegym.backend.dto.InvoiceDetailResponseDTO;
import com.codegym.backend.dto.InvoiceResponseDTO;
import com.codegym.backend.service.OrderService;
import com.codegym.backend.service.StatisticService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/statistics")
@CrossOrigin("*")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')") // Cho phép cả ADMIN và STAFF xem danh sách hóa đơn
public class StatisticController {

    private final StatisticService statisticService;
    private final OrderService orderService;

    /**
     * 1. Lấy danh sách hóa đơn (Hỗ trợ lọc theo bàn, khoảng thời gian hoặc theo
     * ngày/loại)
     */
    @GetMapping("/invoices")
    public ResponseEntity<List<InvoiceResponseDTO>> getInvoices(
            @RequestParam(required = false) Long tableId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        // Nếu có truyền startDate hoặc endDate, ưu tiên lọc theo khoảng thời gian
        if (startDate != null || endDate != null) {
            return ResponseEntity.ok(statisticService.getInvoicesByFilter(tableId, startDate, endDate));
        }

        // Mặc định lọc theo type / date lẻ
        return ResponseEntity.ok(statisticService.getInvoices(tableId, type, date));
    }

    /**
     * 2. Lấy chi tiết món ăn của 1 hóa đơn
     */
    @GetMapping("/invoices/{orderId}")
    public ResponseEntity<InvoiceDetailResponseDTO> getInvoiceDetail(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getInvoiceDetailForCustomer(orderId, null));
    }

    /**
     * 3. Lấy dữ liệu Thống kê Dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(statisticService.getDashboardStats());
    }
}