package com.codegym.backend.service;

import java.util.List;
import com.codegym.backend.dto.ItemResponse;

public interface ItemService {
    List<ItemResponse> getAllItems();
    List<ItemResponse> getLatestItems();
    List<ItemResponse> getBestSellerItems();
    ItemResponse getItemById(Long itemId);
    List<ItemResponse> getDeletedItems();
    void restoreItem(Long itemId);
}