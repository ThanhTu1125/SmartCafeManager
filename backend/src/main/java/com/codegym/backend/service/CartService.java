package com.codegym.backend.service;

import com.codegym.backend.dto.CartResponseDTO;

public interface CartService {
    void addItemToCart(Long tableId, Long itemId, Integer quantity, String note);
    CartResponseDTO getCartOverview(Long tableId);
    void updateCartItemDetail(Long tableId, Long itemId, Integer newQuantity, String newNote);
    void removeItemFromCart(Long tableId, Long itemId);
    void clearTemporaryCart(Long tableId);
    void confirmOrder(Long tableId);
}