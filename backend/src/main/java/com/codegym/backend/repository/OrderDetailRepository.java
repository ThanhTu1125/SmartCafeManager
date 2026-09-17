package com.codegym.backend.repository;

import com.codegym.backend.entity.OrderDetail;
import com.codegym.backend.entity.TableOrder;
import com.codegym.backend.enums.StatusOrderDetail;
import com.codegym.backend.enums.StatusTableOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

    // ==========================================
    // 1. CHỨC NĂNG TRUY VẤN CHI TIẾT ĐƠN HÀNG
    // ==========================================

    List<OrderDetail> findByOrder(TableOrder order);

    List<OrderDetail> findByOrderTableOrderId(Long orderId);

    List<OrderDetail> findByOrderTableOrderIdAndItemItemIdAndStatus(
            Long orderId, 
            Long itemId, 
            StatusOrderDetail status
    );

    List<OrderDetail> findByOrderTableOrderIdAndStatus(Long orderId, StatusOrderDetail status);

    List<OrderDetail> findByOrderTableOrderIdAndStatusNot(Long orderId, StatusOrderDetail status);

    // 🟢 Lấy danh sách theo nhiều trạng thái (Ví dụ: SERVED hoặc DELIVERED)
    List<OrderDetail> findByOrderTableOrderIdAndStatusIn(Long orderId, Collection<StatusOrderDetail> statuses);


    // ==========================================
    // 2. KIỂM TRA ĐIỀU KIỆN ĐÁNH GIÁ (FEEDBACK)
    // ==========================================

    // 🟢 Kiểm tra món có trong hóa đơn cụ thể hay không
    boolean existsByOrderTableOrderIdAndItemItemId(Long orderId, Long itemId);

    // 🟢 Kiểm tra Khách hàng ĐÃ ĐĂNG NHẬP đã mua & hoàn tất thanh toán món này chưa (theo Customer ID)
    @Query("SELECT COUNT(od) > 0 FROM OrderDetail od " +
           "WHERE od.order.customer.customerId = :customerId " +
           "AND od.item.itemId = :itemId " +
           "AND od.order.status = :status")
    boolean existsByCustomerAndItemAndOrderStatus(
            @Param("customerId") Long customerId,
            @Param("itemId") Long itemId,
            @Param("status") StatusTableOrder status
    );

    // 🟢 Kiểm tra Khách hàng ĐÃ ĐĂNG NHẬP đã mua & hoàn tất thanh toán món này chưa (theo Email trong Account)
    @Query("SELECT COUNT(od) > 0 FROM OrderDetail od " +
           "WHERE od.order.customer IS NOT NULL " +
           "AND od.order.customer.account IS NOT NULL " +
           "AND od.order.customer.account.email = :email " +
           "AND od.item.itemId = :itemId " +
           "AND od.order.status = :status")
    boolean existsByEmailAndItemAndOrderStatus(
            @Param("email") String email,
            @Param("itemId") Long itemId,
            @Param("status") StatusTableOrder status
    );


    // ===========================================
    // 3. BÁO CÁO & THỐNG KÊ (STATISTICS)
    // ==========================================

    // 🟢 Thống kê doanh thu theo từng danh mục (Linh hoạt truyền tham số Trạng thái)bh
    @Query("SELECT c.categoryId, c.categoryName, COALESCE(SUM(od.quantity * od.unitPrice), 0) " +
           "FROM OrderDetail od " +
           "JOIN od.item i " +
           "JOIN i.category c " +
           "JOIN od.order o " +
           "WHERE o.status IN :statuses " +
           "GROUP BY c.categoryId, c.categoryName")
    List<Object[]> getSalesByCategories(@Param("statuses") List<StatusTableOrder> statuses);
}