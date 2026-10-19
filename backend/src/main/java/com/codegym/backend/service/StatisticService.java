package com.codegym.backend.service;

import com.codegym.backend.dto.DashboardStatsDTO;
import com.codegym.backend.dto.InvoiceResponseDTO;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

public interface StatisticService {



    DashboardStatsDTO getDashboardStats();

    List<InvoiceResponseDTO> getInvoicesByFilter(Long tableId, LocalDate startDate, LocalDate endDate);



    List<InvoiceResponseDTO> getInvoices(Long tableId, String type, Date date);


    List<InvoiceResponseDTO> getInvoices(Long tableId, Date date);

    List<InvoiceResponseDTO> getInvoices(Long tableId);
}