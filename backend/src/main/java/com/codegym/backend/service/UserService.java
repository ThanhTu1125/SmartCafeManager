package com.codegym.backend.service;

import java.util.Date;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.codegym.backend.dto.ChangePasswordRequest;
import com.codegym.backend.dto.UpdateProfileRequest;
import com.codegym.backend.dto.UserProfileResponse;
import com.codegym.backend.entity.Account;
import com.codegym.backend.entity.Customer;
import com.codegym.backend.entity.Employee;
import com.codegym.backend.exception.AppException;
import com.codegym.backend.repository.AccountRepository;
import com.codegym.backend.repository.CustomerRepository;
import com.codegym.backend.repository.EmployeeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final AccountRepository accountRepository;
    private final EmployeeRepository employeeRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;

    public UserProfileResponse getCurrentUserProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Account account = accountRepository.findByUsernameAndDeletedAtIsNull(username)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy tài khoản hoặc tài khoản đã bị xóa!"));

        String roleName = account.getRole() != null ? account.getRole().getRoleName() : "USER";

        Optional<Employee> empOpt = employeeRepository.findByAccount(account);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            return UserProfileResponse.builder()
                    .username(account.getUsername())
                    .email(account.getEmail())
                    .fullName(emp.getFullName())
                    .dateOfBirth(emp.getDateOfBirth())
                    .gender(emp.getGender() != null ? emp.getGender().name() : null)
                    .phone(emp.getPhoneNumber())
                    .address(emp.getAddress())
                    .salary(emp.getSalary())
                    .imageUrl(emp.getImageUrl())
                    .roleName(roleName)
                    .build();
        }

        Optional<Customer> cusOpt = customerRepository.findByAccount(account);
        if (cusOpt.isPresent()) {
            Customer cus = cusOpt.get();
            return UserProfileResponse.builder()
                    .username(account.getUsername())
                    .email(account.getEmail())
                    .fullName(cus.getFullName())
                    .dateOfBirth(cus.getDateOfBirth())
                    .gender(cus.getGender() != null ? cus.getGender().name() : null)
                    .phone(cus.getPhoneNumber())
                    .address(cus.getAddress())
                    .loyaltyPoints(cus.getLoyaltyPoints())
                    .imageUrl(cus.getImageUrl())
                    .roleName(roleName)
                    .build();
        }

        throw new AppException(HttpStatus.NOT_FOUND, "Tài khoản chưa được thiết lập thông tin cá nhân!");
    }

    @SuppressWarnings("null")
    @Transactional
    public UserProfileResponse updateProfile(UpdateProfileRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account account = accountRepository.findByUsernameAndDeletedAtIsNull(username)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản!"));

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String newEmail = request.getEmail().trim();

            if (!newEmail.equalsIgnoreCase(account.getEmail())) {
                Optional<Account> existingAccount = accountRepository.findByEmailAndDeletedAtIsNull(newEmail);
                if (existingAccount.isPresent()) {
                    throw new AppException(HttpStatus.CONFLICT,
                            "Email này đã được một tài khoản khác đăng ký trong hệ thống!");
                }
                account.setEmail(newEmail);
                accountRepository.save(account);
            }
        }

        Optional<Employee> empOpt = employeeRepository.findByAccount(account);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
                emp.setFullName(request.getFullName());
            }
            if (request.getDateOfBirth() != null)
                emp.setDateOfBirth(request.getDateOfBirth());
            if (request.getGender() != null)
                emp.setGender(request.getGender());
            if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
                String newPhone = request.getPhoneNumber().trim();

                if (employeeRepository.existsByPhoneNumberAndAccountNot(newPhone, account)) {
                    throw new AppException(HttpStatus.CONFLICT, "Số điện thoại đã tồn tại");
                }

                emp.setPhoneNumber(newPhone);
            }
            if (request.getAddress() != null)
                emp.setAddress(request.getAddress());

            employeeRepository.save(emp);
            return getCurrentUserProfile();
        }

        Optional<Customer> cusOpt = customerRepository.findByAccount(account);
        if (cusOpt.isPresent()) {
            Customer cus = cusOpt.get();
            if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
                cus.setFullName(request.getFullName());
            }
            if (request.getDateOfBirth() != null)
                cus.setDateOfBirth(request.getDateOfBirth());
            if (request.getGender() != null)
                cus.setGender(request.getGender());
            if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
                String newPhone = request.getPhoneNumber().trim();

                if (customerRepository.existsByPhoneNumberAndAccountNot(newPhone, account)) {
                    throw new AppException(HttpStatus.CONFLICT, "Số điện thoại đã tồn tại");
                }

                cus.setPhoneNumber(newPhone);
            }
            if (request.getAddress() != null)
                cus.setAddress(request.getAddress());

            customerRepository.save(cus);
            return getCurrentUserProfile();
        }

        throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ cá nhân để cập nhật!");
    }

    @Transactional
    public String changePassword(ChangePasswordRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account account = accountRepository.findByUsernameAndDeletedAtIsNull(username)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại!"));
        if (!passwordEncoder.matches(request.getOldPassword(), account.getPassword())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mật khẩu cũ không chính xác!");
        }
        if (request.getNewPassword().equals(request.getOldPassword())) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Mật khẩu mới không được trùng với mật khẩu cũ!");
        }

        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        account.setPasswordChangedAt(new Date());
        accountRepository.save(account);

        return "Đổi mật khẩu thành công!";
    }

    @Transactional(rollbackFor = Exception.class)
    public UserProfileResponse uploadAvatar(MultipartFile file) throws Exception {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account account = accountRepository.findByUsernameAndDeletedAtIsNull(username)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản!"));

        String newImageUrl = cloudinaryService.uploadImage(file);
        if (newImageUrl == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Upload ảnh thất bại hoặc file trống!");
        }

        Optional<Employee> empOpt = employeeRepository.findByAccount(account);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            if (emp.getImageUrl() != null)
                cloudinaryService.deleteImage(emp.getImageUrl());
            emp.setImageUrl(newImageUrl);
            employeeRepository.save(emp);
            return getCurrentUserProfile();
        }

        Optional<Customer> cusOpt = customerRepository.findByAccount(account);
        if (cusOpt.isPresent()) {
            Customer cus = cusOpt.get();
            if (cus.getImageUrl() != null)
                cloudinaryService.deleteImage(cus.getImageUrl());
            cus.setImageUrl(newImageUrl);
            customerRepository.save(cus);
            return getCurrentUserProfile();
        }

        throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ cá nhân để cập nhật!");
    }
}