package com.codegym.backend.service;

import com.codegym.backend.dto.DashboardStatsDTO;
import com.codegym.backend.dto.InvoiceResponseDTO;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

public interface StatisticService {


    //  * 1. Lấy dữ liệu thống kê tổng quan (Dashboard)

    DashboardStatsDTO getDashboardStats();

    //  * 2. Lọc danh sách hóa đơn theo khoảng thời gian (LocalDate) và bàn
    List<InvoiceResponseDTO> getInvoicesByFilter(Long tableId, LocalDate startDate, LocalDate endDate);


    //  * 3. Lọc danh sách hóa đơn theo bàn, loại (TODAY/MONTH) hoặc ngày chỉ định

    List<InvoiceResponseDTO> getInvoices(Long tableId, String type, Date date);

    //  * các method overload hỗ trợ gọi nhanh

    List<InvoiceResponseDTO> getInvoices(Long tableId, Date date);

    List<InvoiceResponseDTO> getInvoices(Long tableId);
}