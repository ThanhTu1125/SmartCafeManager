package com.codegym.backend.dto;

import java.math.BigDecimal;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String username;
    private String email;
    private String fullName;
    private Date dateOfBirth;
    private String gender;
    private String phone;
    private String address;
    private BigDecimal salary;
    private Integer loyaltyPoints;
    private String roleName;
    private String imageUrl;
}