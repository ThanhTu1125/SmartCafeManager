package com.codegym.backend.repository;

import com.codegym.backend.dto.ItemResponse;
import com.codegym.backend.entity.Item;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    // 1. Lấy danh sách item sắp xếp theo Id giảm dần (hỗ trợ phân trang)
    List<Item> findByDeletedAtIsNullOrderByItemIdDesc(Pageable pageable);

    // 2. Lấy danh sách item sắp xếp theo lượt mua giảm dần (hỗ trợ phân trang)
    List<Item> findByDeletedAtIsNullOrderByTotalOrderCountDesc(Pageable pageable);

    // 3. Lấy toàn bộ danh sách item chưa xóa, chuyển thẳng về ItemResponse DTO
    @Query("SELECT new com.codegym.backend.dto.ItemResponse(i.itemId, i.itemCode, c.categoryId, c.categoryName, i.itemName, i.price, i.description, i.imageUrl, i.isAvailable, i.totalOrderCount) "
            + "FROM Item i LEFT JOIN i.category c "
            + "WHERE i.deletedAt IS NULL")
    List<ItemResponse> findAllItemsAsDTO(Pageable pageable);

    // 4. Lấy danh sách món mới nhất, chuyển thẳng về ItemResponse DTO
    @Query("SELECT new com.codegym.backend.dto.ItemResponse(i.itemId, i.itemCode, c.categoryId, c.categoryName, i.itemName, i.price, i.description, i.imageUrl, i.isAvailable, i.totalOrderCount) "
            + "FROM Item i LEFT JOIN i.category c "
            + "WHERE i.deletedAt IS NULL "
            + "ORDER BY i.createdAt DESC, i.itemId DESC")
    List<ItemResponse> findLatestItems(Pageable pageable);

    // 5. Lấy danh sách món bán chạy nhất, chuyển thẳng về ItemResponse DTO
    @Query("SELECT new com.codegym.backend.dto.ItemResponse(i.itemId, i.itemCode, c.categoryId, c.categoryName, i.itemName, i.price, i.description, i.imageUrl, i.isAvailable, i.totalOrderCount) "
            + "FROM Item i LEFT JOIN i.category c "
            + "WHERE i.deletedAt IS NULL "
            + "ORDER BY i.totalOrderCount DESC")
    List<ItemResponse> findBestSellerItems(Pageable pageable);
    List<Item> findByIsAvailableFalse();

    boolean existsByItemCode(String itemCode);
    boolean existsByItemCodeAndItemIdNot(String itemCode, Long itemId);
}