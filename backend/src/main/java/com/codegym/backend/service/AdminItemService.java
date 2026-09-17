package com.codegym.backend.service;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import com.codegym.backend.dto.ItemResponse;

public interface AdminItemService {
    List<ItemResponse> getAllItems();
    List<ItemResponse> getDeletedItems();
    ItemResponse getItemById(Long itemId);
    ItemResponse createItem(String itemCode, String itemName, BigDecimal price, String description, Long categoryId, String newCategoryName, MultipartFile image);
    ItemResponse updateItem(Long itemId, String itemCode, String itemName, BigDecimal price, String description, Long categoryId, String newCategoryName, Boolean isAvailable, MultipartFile image);
    void deleteItem(Long itemId);
    void restoreItem(Long itemId);
}