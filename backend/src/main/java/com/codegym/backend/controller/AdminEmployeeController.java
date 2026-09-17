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

import com.codegym.backend.dto.EmployeeRequest;
import com.codegym.backend.service.EmployeeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin/employees")
@CrossOrigin("*")
@RequiredArgsConstructor
public class AdminEmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createEmployee(
            @Valid @ModelAttribute EmployeeRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            return ResponseEntity.ok(employeeService.createEmployee(request, image));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi thêm nhân viên: " + e.getMessage());
        }
    }

    @PostMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateEmployee(
            @PathVariable Long id,
            @Valid @ModelAttribute EmployeeRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            return ResponseEntity.ok(employeeService.updateEmployee(id, request, image));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi cập nhật nhân viên: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        try {
            employeeService.deleteEmployee(id);
            return ResponseEntity.ok("Xóa nhân viên thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi xóa nhân viên: " + e.getMessage());
        }
    }
}