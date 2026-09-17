package com.codegym.backend.dto;

import java.util.Date;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NewsListResponse {
    private Long newsId;
    private String title;
    private String summary;
    private String imageUrl;
    private Date createdAt;
    private String author;
    private String status;
}