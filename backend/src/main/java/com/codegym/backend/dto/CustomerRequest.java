package com.codegym.backend.dto;

import com.codegym.backend.enums.Gender;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerRequest {
    private String username;
    private String password;
    private String email;
    private String fullName;
    private String dateOfBirth;
    private Gender gender;
    private String phoneNumber;
    private String address;
    private Integer loyaltyPoints;
}