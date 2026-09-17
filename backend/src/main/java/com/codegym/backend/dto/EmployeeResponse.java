package com.codegym.backend.dto;

import java.math.BigDecimal;
import java.util.Date;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class EmployeeResponse {
    private Long employeeId;
    private String username;
    private String email;
    private String fullName;
    private Date dateOfBirth;
    private String gender;
    private String phoneNumber;
    private String address;
    private BigDecimal salary;
    private String imageUrl;
    private String status;
}