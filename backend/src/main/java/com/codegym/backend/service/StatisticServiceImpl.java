package com.codegym.backend.service;

import com.codegym.backend.dto.DashboardStatsDTO;
import com.codegym.backend.dto.InvoiceResponseDTO;
import com.codegym.backend.entity.TableOrder;
import com.codegym.backend.enums.StatusTableOrder;
import com.codegym.backend.repository.TableOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticServiceImpl implements StatisticService {

    private final TableOrderRepository tableOrderRepository;

    // 1. LỌC HÓA ĐƠN THEO BÀN VÀ KHOẢNG THỜI GIAN (LocalDate)
    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponseDTO> getInvoicesByFilter(Long tableId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = (endDate != null) ? endDate.atTime(LocalTime.MAX) : null;

        List<TableOrder> orders = tableOrderRepository.filterInvoices(tableId, startDateTime, endDateTime);
        return orders.stream().map(this::mapToInvoiceDTO).collect(Collectors.toList());
    }

    // 2. LẤY HÓA ĐƠN THEO TYPE (TODAY/MONTH) VÀ NGÀY LẺ (Date)
    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponseDTO> getInvoices(Long tableId, String type, Date date) {
        LocalDateTime startDate;
        LocalDateTime endDate;

        if (date != null) {
            LocalDate targetLocalDate = date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            startDate = targetLocalDate.atStartOfDay();
            endDate = targetLocalDate.atTime(LocalTime.MAX);
        } else if ("MONTH".equalsIgnoreCase(type)) {
            LocalDate today = LocalDate.now();
            startDate = today.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
            endDate = today.with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX);
        } else if ("TODAY".equalsIgnoreCase(type)) {
            LocalDate today = LocalDate.now();
            startDate = today.atStartOfDay();
            endDate = today.atTime(LocalTime.MAX);
        } else {
            // Mặc định: Không giới hạn ngày để xem toàn bộ danh sách hóa đơn
            startDate = null;
            endDate = null;
        }

        // Đã chuyển sang dùng filterInvoices thống nhất
        List<TableOrder> orders = tableOrderRepository.filterInvoices(tableId, startDate, endDate);
        return orders.stream().map(this::mapToInvoiceDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponseDTO> getInvoices(Long tableId, Date date) {
        return getInvoices(tableId, null, date);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponseDTO> getInvoices(Long tableId) {
        return getInvoices(tableId, "TODAY", null);
    }

    // 3. LẤY DỮ LIỆU DASHBOARD THỐNG KÊ
    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        LocalDate today = LocalDate.now();

        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.atTime(LocalTime.MAX);

        LocalDateTime startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
        LocalDateTime endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX);

        // A. Thẻ Tổng quan
        Double todayRevenue = tableOrderRepository.sumRevenueBetween(startOfToday, endOfToday, StatusTableOrder.PAID);
        Long todayOrderCount = tableOrderRepository.countOrdersBetween(startOfToday, endOfToday, StatusTableOrder.PAID);
        Double monthRevenue = tableOrderRepository.sumRevenueBetween(startOfMonth, endOfMonth, StatusTableOrder.PAID);

        // B. Biểu đồ đường theo tuần
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        List<DashboardStatsDTO.WeeklyRevenueDTO> weeklyRevenueList = new ArrayList<>();
        String[] dayNames = { "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật" };

        for (int i = 0; i < 7; i++) {
            LocalDate currentDay = startOfWeek.plusDays(i);
            LocalDateTime start = currentDay.atStartOfDay();
            LocalDateTime end = currentDay.atTime(LocalTime.MAX);

            Double dayRev = tableOrderRepository.sumRevenueBetween(start, end, StatusTableOrder.PAID);
            weeklyRevenueList.add(new DashboardStatsDTO.WeeklyRevenueDTO(dayNames[i], dayRev != null ? dayRev : 0.0));
        }

        // C. Biểu đồ tròn theo danh mục
        List<Object[]> rawCategorySales = tableOrderRepository.getSalesGroupedByCategory();
        List<DashboardStatsDTO.CategorySalesDTO> categorySalesList = rawCategorySales.stream()
                .map(row -> {
                    String categoryName = row[0] != null ? row[0].toString() : "Khác";
                    Long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
                    return new DashboardStatsDTO.CategorySalesDTO(categoryName, count);
                })
                .collect(Collectors.toList());

        return DashboardStatsDTO.builder()
                .todayRevenue(todayRevenue != null ? todayRevenue : 0.0)
                .todayOrderCount(todayOrderCount != null ? todayOrderCount : 0L)
                .monthRevenue(monthRevenue != null ? monthRevenue : 0.0)
                .weeklyRevenue(weeklyRevenueList)
                .categorySales(categorySalesList)
                .build();
    }

    // --- HELPER METHODS ---
    private InvoiceResponseDTO mapToInvoiceDTO(TableOrder order) {
        Long tId = (order.getTable() != null) ? order.getTable().getTableId() : null;
        String tableName = (order.getTable() != null) ? order.getTable().getTableName() : "Mang về";
        Double total = (order.getTotalAmount() != null) ? order.getTotalAmount().doubleValue() : 0.0;

        return InvoiceResponseDTO.builder()
                .orderId(order.getTableOrderId())
                .invoiceCode(String.format("#HD%04d", order.getTableOrderId()))
                .tableId(tId)
                .tableName(tableName)
                .totalAmount(total)
                .createdAt(toDate(order.getCreatedAt()))
                .openAt(toDate(order.getOpenAt()))
                .paidAt(toDate(order.getPaidAt()))
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null)
                .build();
    }

    private Date toDate(Object timeObj) {
        if (timeObj == null)
            return null;
        if (timeObj instanceof Date)
            return (Date) timeObj;
        if (timeObj instanceof LocalDateTime) {
            return Date.from(((LocalDateTime) timeObj).atZone(ZoneId.systemDefault()).toInstant());
        }
        return null;
    }
}