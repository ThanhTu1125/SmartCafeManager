package com.codegym.backend.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.codegym.backend.dto.CustomerRequest;
import com.codegym.backend.service.CustomerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin/customers")
@CrossOrigin("*")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final CustomerService customerService;

    // Lấy danh sách khách hàng
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    // Admin tạo tài khoản khách hàng (nếu cần)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCustomer(
            @ModelAttribute CustomerRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            return ResponseEntity.ok(customerService.createCustomer(request, image));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi thêm khách hàng: " + e.getMessage());
        }
    }

    // Cập nhật thông tin khách hàng
    @PostMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCustomer(
            @PathVariable Long id,
            @ModelAttribute CustomerRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            return ResponseEntity.ok(customerService.updateCustomer(id, request, image));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi cập nhật khách hàng: " + e.getMessage());
        }
    }

    // Xóa mềm / Khóa tài khoản khách hàng
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        try {
            customerService.deleteCustomer(id);
            return ResponseEntity.ok("Khóa/Xóa tài khoản khách hàng thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi xóa khách hàng: " + e.getMessage());
        }
    }
}