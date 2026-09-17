package com.codegym.backend.dto;

import java.math.BigDecimal;

import com.codegym.backend.enums.Gender;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeRequest {
    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    @Email(message = "Định dạng email không hợp lệ")
    private String email;
    private String fullName;
    private String dateOfBirth;
    private Gender gender;
    private String phoneNumber;
    private String address;

    @Min(value = 0, message = "Lương phải lớn hơn hoặc bằng 0")
    private BigDecimal salary;
}