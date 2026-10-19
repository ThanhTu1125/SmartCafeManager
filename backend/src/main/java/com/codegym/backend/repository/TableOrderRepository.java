package com.codegym.backend.repository;

import com.codegym.backend.entity.TableOrder;
import com.codegym.backend.enums.StatusTableOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TableOrderRepository extends JpaRepository<TableOrder, Long> {
    List<TableOrder> findAllByOrderByTableOrderIdDesc();

    Optional<TableOrder> findByTableTableIdAndStatus(Long tableId, StatusTableOrder status);

    Optional<TableOrder> findByTableTableIdAndStatusIn(Long tableId, Collection<StatusTableOrder> statuses);

    Optional<TableOrder> findByTableOrderIdAndTableTableIdAndStatus(
            Long tableOrderId,
            Long tableId,
            StatusTableOrder status);

    @Modifying
    @Transactional
    @Query("UPDATE OrderDetail od " +
           "SET od.status = com.codegym.backend.enums.StatusOrderDetail.ORDERED " +
           "WHERE od.order.tableOrderId = :tableOrderId " +
           "AND od.status = com.codegym.backend.enums.StatusOrderDetail.PENDING")
    int updatePendingItemsToOrdered(@Param("tableOrderId") Long tableOrderId);



    @Query("SELECT o FROM TableOrder o WHERE o.status = :status " +
           "AND (:tableId IS NULL OR o.table.tableId = :tableId) " +
           "ORDER BY o.openAt DESC")
    List<TableOrder> findInvoicesByTableAndStatus(
            @Param("tableId") Long tableId,
            @Param("status") StatusTableOrder status);

    @Query("SELECT o FROM TableOrder o " +
           "LEFT JOIN FETCH o.table t " +
           "WHERE o.status = com.codegym.backend.enums.StatusTableOrder.PAID " +
           "AND (:tableId IS NULL OR t.tableId = :tableId) " +
           "AND (:startDate IS NULL OR COALESCE(o.paidAt, o.createdAt) >= :startDate) " +
           "AND (:endDate IS NULL OR COALESCE(o.paidAt, o.createdAt) <= :endDate) " +
           "ORDER BY COALESCE(o.paidAt, o.createdAt) DESC")
    List<TableOrder> filterInvoices(
            @Param("tableId") Long tableId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);



    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM TableOrder o " +
           "WHERE o.status = :status " +
           "AND COALESCE(o.paidAt, o.createdAt) BETWEEN :startDate AND :endDate")
    Double sumRevenueBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("status") StatusTableOrder status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM TableOrder o " +
           "WHERE o.status = com.codegym.backend.enums.StatusTableOrder.PAID " +
           "AND COALESCE(o.paidAt, o.createdAt) BETWEEN :startDate AND :endDate")
    Double sumRevenueBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(o) FROM TableOrder o " +
           "WHERE o.status = :status " +
           "AND COALESCE(o.paidAt, o.createdAt) BETWEEN :startDate AND :endDate")
    Long countOrdersBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("status") StatusTableOrder status);

    @Query("SELECT COUNT(o) FROM TableOrder o " +
           "WHERE o.status = com.codegym.backend.enums.StatusTableOrder.PAID " +
           "AND COALESCE(o.paidAt, o.createdAt) BETWEEN :startDate AND :endDate")
    Long countOrdersBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);



    @Query("SELECT c.categoryName, SUM(od.quantity) " +
           "FROM OrderDetail od " +
           "JOIN od.item i " +
           "JOIN i.category c " +
           "JOIN od.order o " +
           "WHERE o.status = com.codegym.backend.enums.StatusTableOrder.PAID " +
           "GROUP BY c.categoryId, c.categoryName")
    List<Object[]> getSalesGroupedByCategory();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM TableOrder o " +
           "WHERE CAST(COALESCE(o.paidAt, o.createdAt) AS date) = CURRENT_DATE " +
           "AND o.status = :status")
    Double getTodayRevenue(@Param("status") StatusTableOrder status);

    @Query("SELECT COUNT(o) FROM TableOrder o " +
           "WHERE CAST(COALESCE(o.paidAt, o.createdAt) AS date) = CURRENT_DATE " +
           "AND o.status = :status")
    Long getTodayOrderCount(@Param("status") StatusTableOrder status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM TableOrder o " +
           "WHERE FUNCTION('MONTH', COALESCE(o.paidAt, o.createdAt)) = FUNCTION('MONTH', CURRENT_DATE) " +
           "AND FUNCTION('YEAR', COALESCE(o.paidAt, o.createdAt)) = FUNCTION('YEAR', CURRENT_DATE) " +
           "AND o.status = :status")
    Double getMonthlyRevenue(@Param("status") StatusTableOrder status);



    @Query("SELECT DISTINCT o FROM TableOrder o " +
           "LEFT JOIN FETCH o.table t " +
           "LEFT JOIN FETCH o.customer c " +
           "LEFT JOIN FETCH o.employee e " +
           "WHERE (:status IS NULL OR o.status = :status) " +
           "AND (:tableId IS NULL OR t.tableId = :tableId) " +
           "AND (:startDate IS NULL OR COALESCE(o.paidAt, o.openAt) >= :startDate) " +
           "AND (:endDate IS NULL OR COALESCE(o.paidAt, o.openAt) <= :endDate) " +
           "AND (:keyword IS NULL OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(c.phoneNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR CAST(o.tableOrderId AS string) LIKE CONCAT('%', :keyword, '%')) " +
           "ORDER BY o.tableOrderId DESC")
    List<TableOrder> adminFilterOrders(
            @Param("status") StatusTableOrder status,
            @Param("tableId") Long tableId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("keyword") String keyword);

    @Query("SELECT o FROM TableOrder o " +
           "LEFT JOIN FETCH o.table " +
           "LEFT JOIN FETCH o.customer " +
           "LEFT JOIN FETCH o.employee " +
           "WHERE o.tableOrderId = :orderId")
    Optional<TableOrder> findByIdWithDetails(@Param("orderId") Long orderId);
}