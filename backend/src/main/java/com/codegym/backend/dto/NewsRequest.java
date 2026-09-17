package com.codegym.backend.dto;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NewsRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
    private String title;

    @Size(max = 10000, message = "Tóm tắt không được vượt quá 10000 ký tự")
    private String summary;

    @NotBlank(message = "Nội dung không được để trống")
    @Size(max = 1000000, message = "Nội dung không được vượt quá 1000000 ký tự")
    private String content;

    private MultipartFile image;
}