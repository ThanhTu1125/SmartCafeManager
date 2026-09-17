package com.codegym.backend.service;

import com.codegym.backend.dto.ActiveOrderDTO;
import com.codegym.backend.dto.OrderDetailResponseDTO;
import com.codegym.backend.entity.Tables;
import com.codegym.backend.enums.ServiceStatus;

import java.util.List;

public interface StaffOrderService {

    List<Tables> getAllTables();

    Tables getTableInfo(Long tableId);

    // 💡 Đổi Map<String, Object> thành ActiveOrderDTO ở dấydada
    ActiveOrderDTO getActiveOrderByTable(Long tableId);

    //  (trả về DTO):
    List<OrderDetailResponseDTO> getOrderDetailsByTable(Long tableId);

    void approveCashPayment(Long tableId);

    void cancelTableOrder(Long tableId, String reason);

    void updateTableServiceStatus(Long tableId, ServiceStatus status);

    void confirmOrderItems(Long tableOrderId);

    void markItemAsServed(Long orderDetailId);

    void cancelOrderItem(Long orderDetailId, String reason);

    void updateOrderItem(Long orderDetailId, Integer newQuantity, String newNote);

    void deleteOrderItem(Long orderDetailId);
    void serveAllItemsByTable(Long tableId);
    void confirmAllNewItemsByTable(Long tableId);
    
    
}