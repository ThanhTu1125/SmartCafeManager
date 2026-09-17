package com.codegym.backend.service;

import com.codegym.backend.entity.Item;
import com.codegym.backend.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class StaffItemService {

    private final ItemRepository itemRepository;

    @Transactional
    public void updateItemAvailability(Long itemId, Boolean isAvailable) {
        // Kiểm tra null để xóa sạch cảnh báo Null Safety
        Objects.requireNonNull(itemId, "itemId không được để null");

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn ID: " + itemId));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        item.setIsAvailable(isAvailable);
        item.setUpdatedBy(username);
        item.setUpdatedAt(new Date());

        itemRepository.save(item);
    }
}