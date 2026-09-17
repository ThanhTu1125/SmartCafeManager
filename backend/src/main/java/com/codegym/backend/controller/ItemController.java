package com.codegym.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.codegym.backend.dto.ItemResponse;
import com.codegym.backend.service.ItemService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    /**
     * Lấy danh sách toàn bộ món ăn/thức uống đang hoạt động (chưa bị xóa mềm).
     * Thường dùng để hiển thị toàn bộ thực đơn (menu) cho khách hàng.
     *
     * Yêu cầu phân quyền: Công khai, không yêu cầu đăng nhập.
     *
     * Đường dẫn API: GET http://localhost:8080/api/v1/items
     */
    @GetMapping
    public ResponseEntity<List<ItemResponse>> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }

    /**
     * Lấy danh sách các món ăn/thức uống mới nhất được thêm vào hệ thống.
     * Số lượng trả về thường được giới hạn ở tầng Service.
     * Thường được sử dụng để hiển thị trên mục "Món mới" ở trang chủ.
     *
     * Yêu cầu phân quyền: Công khai, không yêu cầu đăng nhập.
     *
     * Đường dẫn API: GET http://localhost:8080/api/v1/items/latest
     */
    @GetMapping("/latest")
    public ResponseEntity<List<ItemResponse>> getLatestItems() {
        return ResponseEntity.ok(itemService.getLatestItems());
    }

    /**
     * Lấy danh sách các món ăn/thức uống bán chạy nhất dựa trên tổng số lượt
     * gọi món (totalOrderCount). Số lượng trả về thường được giới hạn ở tầng
     * Service.
     * Rất hữu ích để gợi ý cho khách hàng trong mục "Món bán chạy".
     *
     * Yêu cầu phân quyền: Công khai, không yêu cầu đăng nhập.
     *
     * Đường dẫn API: GET http://localhost:8080/api/v1/items/best-sellers
     */
    @GetMapping("/best-sellers")
    public ResponseEntity<List<ItemResponse>> getBestSellerItems() {
        return ResponseEntity.ok(itemService.getBestSellerItems());
    }
}