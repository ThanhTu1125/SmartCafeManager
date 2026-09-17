package com.codegym.backend.dto;

import java.util.Date;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CustomerResponse {
    private Long customerId;
    private String username;
    private String email;
    private String fullName;
    private Date dateOfBirth;
    private String gender;
    private String phoneNumber;
    private String address;
    private Integer loyaltyPoints; // Điểm tích lũy
    private String imageUrl;
    private String status;
}