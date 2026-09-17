package com.codegym.backend.service;

import com.codegym.backend.dto.TableOrderInvoiceDTO;
import com.codegym.backend.dto.TableOrderSummaryDTO;
import com.codegym.backend.enums.PaymentMethod;

public interface PaymentService {
    void processCashPayment(Long tableId);
    void requestCheckout(Long tableId, PaymentMethod paymentMethod);
    void completeCheckout(Long tableId, PaymentMethod paymentMethod);
    TableOrderSummaryDTO getInvoiceSummaryDTO(Long tableId);
    TableOrderInvoiceDTO getCurrentInvoice(Long tableId, Long tableOrderId);
}