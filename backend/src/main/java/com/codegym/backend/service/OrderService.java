package com.codegym.backend.service;

import com.codegym.backend.dto.InvoiceDetailResponseDTO;
import com.codegym.backend.enums.ServiceStatus;

public interface OrderService {

    void updateTableServiceStatus(Long tableId, ServiceStatus status);

    InvoiceDetailResponseDTO getInvoiceDetailForCustomer(Long orderId, Long customerId);

    void cancelOrderItemByCustomer(Long orderDetailId, String reason);
}