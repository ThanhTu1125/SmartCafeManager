package com.codegym.backend.service;

import com.codegym.backend.dto.AdminTableOrderRequestDTO;
import com.codegym.backend.dto.OrderDetailResponseDTO;
import com.codegym.backend.dto.TableOrderResponseDTO;
import com.codegym.backend.entity.TableOrder;
import com.codegym.backend.enums.StatusTableOrder;
import com.codegym.backend.repository.CustomerRepository;
import com.codegym.backend.repository.EmployeeRepository;
import com.codegym.backend.repository.TableOrderRepository;
import com.codegym.backend.repository.TablesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class AdminTableOrderService {

    private final TableOrderRepository tableOrderRepository;
    private final TablesRepository tablesRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;

    public List<TableOrderResponseDTO> getAllOrders() {
        return tableOrderRepository.findAllByOrderByTableOrderIdDesc()
                .stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    @Transactional
    public TableOrderResponseDTO updateOrder(Long orderId, AdminTableOrderRequestDTO dto) {
        TableOrder order = tableOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng ID: " + orderId));

        String adminUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        order.setUpdatedBy(adminUsername);
        order.setUpdatedAt(new Date());

        if (dto.getTotalAmount() != null) order.setTotalAmount(dto.getTotalAmount());
        if (dto.getPaymentMethod() != null) order.setPaymentMethod(dto.getPaymentMethod());

        if (dto.getStatus() != null) {
            order.setStatus(dto.getStatus());
            if (dto.getStatus() == StatusTableOrder.PAID && order.getPaidAt() == null) {
                order.setPaidAt(LocalDateTime.now());
                order.setCloseAt(LocalDateTime.now());
            }
        }

        if (dto.getTableId() != null) {
            tablesRepository.findById(dto.getTableId()).ifPresent(order::setTable);
        }
        if (dto.getCustomerId() != null) {
            customerRepository.findById(dto.getCustomerId()).ifPresent(order::setCustomer);
        }
        if (dto.getEmployeeId() != null) {
            employeeRepository.findById(dto.getEmployeeId()).ifPresent(order::setEmployee);
        }

        TableOrder savedOrder = tableOrderRepository.save(order);
        return convertToResponseDTO(savedOrder);
    }

    @Transactional
    public void softDeleteOrder(Long orderId, String reason) {
        TableOrder order = tableOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng ID: " + orderId));

        String adminUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        order.setIsDeleted(true);
        order.setCancelReason(reason);
        order.setUpdatedBy(adminUsername);
        order.setUpdatedAt(new Date());
        order.setDeletedAt(new Date());
        order.setStatus(StatusTableOrder.CANCELLED);
        order.setCloseAt(LocalDateTime.now());

        tableOrderRepository.save(order);
    }

    private TableOrderResponseDTO convertToResponseDTO(TableOrder order) {
        TableOrderResponseDTO dto = new TableOrderResponseDTO();
        dto.setTableOrderId(order.getTableOrderId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setPaymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().toString() : null);
        dto.setCancelReason(order.getCancelReason());
        dto.setIsDeleted(order.getIsDeleted());

        if (order.getCreatedAt() != null) {
            dto.setCreatedAt(order.getCreatedAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
        }
        dto.setCreatedBy(order.getCreatedBy());
        if (order.getUpdatedAt() != null) {
            dto.setUpdatedAt(order.getUpdatedAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
        }
        dto.setUpdatedBy(order.getUpdatedBy());

        dto.setOpenAt(order.getOpenAt());
        dto.setCloseAt(order.getCloseAt());
        dto.setPaidAt(order.getPaidAt());

        if (order.getTable() != null) {
            dto.setTableId(order.getTable().getTableId());
            dto.setTableName(order.getTable().getTableName());
        }
        if (order.getCustomer() != null) {
            dto.setCustomerId(order.getCustomer().getCustomerId());
            dto.setCustomerName(order.getCustomer().getFullName());
        }
        if (order.getEmployee() != null) {
            dto.setEmployeeId(order.getEmployee().getEmployeeId());
            dto.setEmployeeName(order.getEmployee().getFullName());
        }

        if (order.getOrderDetails() != null) {
            List<OrderDetailResponseDTO> items = order.getOrderDetails().stream().map(detail -> {
                OrderDetailResponseDTO itemDto = new OrderDetailResponseDTO();
                itemDto.setOrderDetailId(detail.getOrderDetailId());
                itemDto.setQuantity(detail.getQuantity());
                itemDto.setUnitPrice(detail.getUnitPrice());
                itemDto.setNote(detail.getNote());
                itemDto.setStatus(detail.getStatus());

                if (detail.getUnitPrice() != null && detail.getQuantity() != null) {
                    itemDto.setTotalPrice(detail.getUnitPrice().multiply(BigDecimal.valueOf(detail.getQuantity())));
                }

                if (detail.getItem() != null) {
                    itemDto.setItemId(detail.getItem().getItemId());
                    itemDto.setItemCode(detail.getItem().getItemCode());
                    itemDto.setItemName(detail.getItem().getItemName());
                }
                return itemDto;
            }).toList();

            dto.setItems(items);
        }

        return dto;
    }
}