package com.codegym.backend.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @SuppressWarnings("unchecked")
    public String uploadImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }
        Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
        return uploadResult.get("secure_url").toString();
    }

    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty() || !imageUrl.contains("cloudinary.com")) {
            return;
        }
        try {
            String[] parts = imageUrl.split("/");
            String lastPart = parts[parts.length - 1];
            String publicId = lastPart.substring(0, lastPart.lastIndexOf('.'));

            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());

            // Biến log lúc này tự động có sẵn nhờ @Slf4j
            log.info("Đã xóa ảnh cũ trên Cloudinary: {}", publicId);
        } catch (Exception e) {
            log.error("Lỗi khi xóa ảnh trên Cloudinary: ", e);
        }
    }
}