package com.codegym.backend.service;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.codegym.backend.dto.CustomerRequest;
import com.codegym.backend.dto.CustomerResponse;
import com.codegym.backend.entity.Account;
import com.codegym.backend.entity.Customer;
import com.codegym.backend.entity.Role;
import com.codegym.backend.enums.AccountStatus;
import com.codegym.backend.exception.AppException;
import com.codegym.backend.repository.AccountRepository;
import com.codegym.backend.repository.CustomerRepository;
import com.codegym.backend.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .filter(cus -> !cus.isDeleted() && !cus.getAccount().isDeleted())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(rollbackFor = Exception.class)
    public CustomerResponse createCustomer(CustomerRequest request, MultipartFile image) throws Exception {
        if (accountRepository.findByUsernameAndDeletedAtIsNull(request.getUsername()).isPresent()) {
            throw new AppException(HttpStatus.CONFLICT, "Tên đăng nhập đã tồn tại!");
        }
        if (accountRepository.findByEmailAndDeletedAtIsNull(request.getEmail()).isPresent()) {
            throw new AppException(HttpStatus.CONFLICT, "Email đã tồn tại!");
        }

        Role userRole = roleRepository.findByRoleName("USER")
                .orElseThrow(() -> new AppException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Lỗi hệ thống: Không tìm thấy quyền USER"));

        Account account = Account.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .role(userRole)
                .status(AccountStatus.ACTIVE)
                .build();

        accountRepository.save(Objects.requireNonNull(account));

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(image);
        }
        Date dob = null;
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().trim().isEmpty()) {
            dob = new SimpleDateFormat("yyyy-MM-dd").parse(request.getDateOfBirth());
        }
        Customer customer = Customer.builder()
                .account(account)
                .fullName(request.getFullName())
                .dateOfBirth(dob)
                .gender(request.getGender())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .loyaltyPoints(request.getLoyaltyPoints() != null ? request.getLoyaltyPoints() : 0)
                .imageUrl(imageUrl)
                .build();

        return mapToResponse(customerRepository.save(Objects.requireNonNull(customer)));
    }

    @Transactional(rollbackFor = Exception.class)
    public CustomerResponse updateCustomer(Long customerId, CustomerRequest request, MultipartFile image)
            throws Exception {

        Customer customer = customerRepository.findById(Objects.requireNonNull(customerId))
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng!"));

        Account account = customer.getAccount();

        if (request.getEmail() != null && !request.getEmail().equals(account.getEmail())) {
            if (accountRepository.findByEmailAndDeletedAtIsNull(request.getEmail()).isPresent()) {
                throw new AppException(HttpStatus.CONFLICT, "Email đã được sử dụng bởi người khác!");
            }
            account.setEmail(request.getEmail());
        }
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            account.setPassword(passwordEncoder.encode(request.getPassword()));
            account.setPasswordChangedAt(new Date());
        }
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().trim().isEmpty()) {
            customer.setDateOfBirth(new SimpleDateFormat("yyyy-MM-dd").parse(request.getDateOfBirth()));
        }

        customer.setFullName(request.getFullName());
        customer.setGender(request.getGender());
        customer.setAddress(request.getAddress());

        if (request.getLoyaltyPoints() != null) {
            customer.setLoyaltyPoints(request.getLoyaltyPoints());
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(customer.getPhoneNumber())) {
            if (customerRepository.existsByPhoneNumberAndAccountNot(request.getPhoneNumber(), account)) {
                throw new AppException(HttpStatus.CONFLICT, "Số điện thoại đã tồn tại!");
            }
            customer.setPhoneNumber(request.getPhoneNumber());
        }

        if (image != null && !image.isEmpty()) {
            if (customer.getImageUrl() != null) {
                cloudinaryService.deleteImage(customer.getImageUrl());
            }
            customer.setImageUrl(cloudinaryService.uploadImage(image));
        }

        accountRepository.save(Objects.requireNonNull(account));
        return mapToResponse(customerRepository.save(Objects.requireNonNull(customer)));
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteCustomer(Long customerId) {
        Customer customer = customerRepository.findById(Objects.requireNonNull(customerId))
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng!"));

        Account account = customer.getAccount();
        Date now = new Date();

        account.setStatus(AccountStatus.INACTIVE);
        account.setDeletedAt(now);

        accountRepository.save(Objects.requireNonNull(account));

        customer.setDeletedAt(now);
        customerRepository.save(Objects.requireNonNull(customer));
    }

    private CustomerResponse mapToResponse(Customer cus) {
        return CustomerResponse.builder()
                .customerId(cus.getCustomerId())
                .username(cus.getAccount().getUsername())
                .email(cus.getAccount().getEmail())
                .fullName(cus.getFullName())
                .dateOfBirth(cus.getDateOfBirth())
                .gender(cus.getGender() != null ? cus.getGender().name() : null)
                .phoneNumber(cus.getPhoneNumber())
                .address(cus.getAddress())
                .loyaltyPoints(cus.getLoyaltyPoints())
                .imageUrl(cus.getImageUrl())
                .status(cus.getAccount().getStatus().name())
                .build();
    }
}