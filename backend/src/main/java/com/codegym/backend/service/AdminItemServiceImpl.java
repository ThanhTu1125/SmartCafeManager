package com.codegym.backend.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.codegym.backend.dto.ItemResponse;
import com.codegym.backend.entity.Item;
import com.codegym.backend.entity.MenuCategory;
import com.codegym.backend.repository.ItemRepository;
import com.codegym.backend.repository.MenuCategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AdminItemServiceImpl implements AdminItemService {

    private final ItemRepository itemRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponse> getAllItems() {
        return itemRepository.findAll().stream()
                .map(this::mapToItemResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponse> getDeletedItems() {
        return itemRepository.findByIsAvailableFalse().stream()
                .map(this::mapToItemResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ItemResponse getItemById(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn với ID: " + itemId));
        return mapToItemResponse(item);
    }

    @Override
    @Transactional
    public ItemResponse createItem(String itemCode, String itemName, BigDecimal price, String description, Long menuCategoryId, String newMenuCategoryName, MultipartFile image) {
        if (price == null || price.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Giá món ăn không hợp lệ (phải >= 0)!");
        }
        
        if (itemCode == null || itemCode.trim().isEmpty()) {
            throw new RuntimeException("Mã món ăn không được để trống!");
        }
        if (itemRepository.existsByItemCode(itemCode.trim())) {
            throw new RuntimeException("Mã món ăn đã tồn tại!");
        }

        String imageUrl = null;
        
        if (image != null && !image.isEmpty()) {
            try {
                imageUrl = cloudinaryService.uploadImage(image);
            } catch (IOException e) {
                throw new RuntimeException("Lỗi khi upload ảnh lên Cloudinary: " + e.getMessage());
            }
        }

        MenuCategory menuCategory = null;
        if (newMenuCategoryName != null && !newMenuCategoryName.trim().isEmpty()) {
            menuCategory = menuCategoryRepository.findByCategoryName(newMenuCategoryName.trim())
                    .orElseGet(() -> {
                        MenuCategory newCat = new MenuCategory();
                        newCat.setCategoryName(newMenuCategoryName.trim()); 
                        return menuCategoryRepository.save(newCat);
                    });
        } else if (menuCategoryId != null) {
            menuCategory = menuCategoryRepository.findById(menuCategoryId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + menuCategoryId));
        }

        Item item = Item.builder()
                .itemCode(itemCode)
                .itemName(itemName)
                .price(price)
                .description(description)
                .imageUrl(imageUrl)
                .isAvailable(true)
                .totalOrderCount(0)
                .category(menuCategory) 
                .build();

        Item savedItem = itemRepository.save(item);
        return mapToItemResponse(savedItem);
    }

    @Override
    @Transactional
    public ItemResponse updateItem(Long itemId, String itemCode, String itemName, BigDecimal price, String description, Long menuCategoryId, String newMenuCategoryName, Boolean isAvailable, MultipartFile image) {
        Item existingItem = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn với ID: " + itemId));

        if (price != null && price.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Giá món ăn không hợp lệ (phải >= 0)!");
        }

        if (itemCode != null && !itemCode.trim().isEmpty()) {
            if (itemRepository.existsByItemCodeAndItemIdNot(itemCode.trim(), itemId)) {
                throw new RuntimeException("Mã món ăn đã tồn tại cho một món khác!");
            }
            existingItem.setItemCode(itemCode.trim());
        }
        if (itemName != null && !itemName.trim().isEmpty()) {
            existingItem.setItemName(itemName.trim());
        }
        if (price != null) {
            existingItem.setPrice(price);
        }
        if (description != null) {
            existingItem.setDescription(description);
        }
        if (isAvailable != null) {
            existingItem.setIsAvailable(isAvailable);
        }

        if (image != null && !image.isEmpty()) {
            try {
                String newImageUrl = cloudinaryService.uploadImage(image);
                existingItem.setImageUrl(newImageUrl); 
            } catch (IOException e) {
                throw new RuntimeException("Lỗi khi upload ảnh mới lên Cloudinary: " + e.getMessage());
            }
        }

        if (newMenuCategoryName != null && !newMenuCategoryName.trim().isEmpty()) {
            MenuCategory menuCategory = menuCategoryRepository.findByCategoryName(newMenuCategoryName.trim())
                    .orElseGet(() -> {
                        MenuCategory newCat = new MenuCategory();
                        newCat.setCategoryName(newMenuCategoryName.trim());
                        return menuCategoryRepository.save(newCat);
                    });
            existingItem.setCategory(menuCategory);
        } else if (menuCategoryId != null) {
            MenuCategory menuCategory = menuCategoryRepository.findById(menuCategoryId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục!"));
            existingItem.setCategory(menuCategory);
        }

        Item updatedItem = itemRepository.save(existingItem);
        return mapToItemResponse(updatedItem);
    }

    @Override
    @Transactional
    public void deleteItem(Long itemId) {
        Item existingItem = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn với ID: " + itemId));
        existingItem.setIsAvailable(false);
        itemRepository.save(existingItem);
    }

    @Override
    @Transactional
    public void restoreItem(Long itemId) {
        Item existingItem = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn với ID: " + itemId));
        existingItem.setIsAvailable(true);
        itemRepository.save(existingItem);
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
}