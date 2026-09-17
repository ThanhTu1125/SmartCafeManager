package com.codegym.backend.service;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.codegym.backend.dto.ItemResponse;
import com.codegym.backend.entity.Item;
import com.codegym.backend.repository.ItemRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponse> getAllItems() {
        return itemRepository.findAllItemsAsDTO(PageRequest.of(0, Integer.MAX_VALUE));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponse> getLatestItems() {
        return itemRepository.findLatestItems(PageRequest.of(0, 4));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponse> getBestSellerItems() {
        return itemRepository.findBestSellerItems(PageRequest.of(0, 4));
    }

    @Override
    @Transactional(readOnly = true)
    public ItemResponse getItemById(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn với ID: " + itemId));
        return mapToItemResponse(item);
    }

    private ItemResponse mapToItemResponse(Item item) {
        return ItemResponse.builder()
                .itemId(item.getItemId())
                .itemCode(item.getItemCode())
                .categoryId(item.getCategory() != null ? item.getCategory().getCategoryId() : null)
                .categoryName(item.getCategory() != null ? item.getCategory().getCategoryName() : null)
                .itemName(item.getItemName())
                .price(item.getPrice())
                .description(item.getDescription())
                .imageUrl(item.getImageUrl())
                .isAvailable(item.getIsAvailable())
                .totalOrderCount(item.getTotalOrderCount())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponse> getDeletedItems() {
        return itemRepository.findByIsAvailableFalse().stream()
                .map(this::mapToItemResponse)
                .toList();
    }

    @Override
    @Transactional
    public void restoreItem(Long itemId) {
        Item existingItem = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn với ID: " + itemId));
        existingItem.setIsAvailable(true);
        itemRepository.save(existingItem);
    }
}