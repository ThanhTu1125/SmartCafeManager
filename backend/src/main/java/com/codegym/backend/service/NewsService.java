package com.codegym.backend.service;

import java.util.Date;
import java.util.Objects;
import java.util.Set;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.codegym.backend.dto.NewsListResponse;
import com.codegym.backend.dto.NewsRequest;
import com.codegym.backend.entity.Account;
import com.codegym.backend.entity.News;
import com.codegym.backend.enums.NewsStatus;
import com.codegym.backend.exception.AppException;
import com.codegym.backend.repository.AccountRepository;
import com.codegym.backend.repository.NewsRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NewsService {

        private final NewsRepository newsRepository;
        private final CloudinaryService cloudinaryService;
        private final SimpMessagingTemplate messagingTemplate;
        private final AccountRepository accountRepository;

        public Page<NewsListResponse> getAllNews(int page, int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<News> newsPage = newsRepository
                                .findByStatusAndDeletedAtIsNullOrderByCreatedAtDesc(NewsStatus.PUBLISHED, pageable);

                return newsPage.map(news -> NewsListResponse.builder()
                                .newsId(news.getNewsId())
                                .title(news.getTitle())
                                .summary(news.getSummary())
                                .imageUrl(news.getImageUrl())
                                .createdAt(news.getCreatedAt())
                                .build());
        }

        public News getNewsById(Long id) {
                News news = newsRepository.findById(Objects.requireNonNull(id))
                                .filter(n -> n.getDeletedAt() == null)
                                .orElseThrow(() -> new RuntimeException(
                                                "Không tìm thấy tin tức hoặc tin tức đã bị xóa!"));

                if (news.getStatus() == NewsStatus.PUBLISHED) {
                        return news;
                }

                org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext()
                                .getAuthentication();
                if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                        throw new RuntimeException("Tin tức chưa được duyệt. Khách vãng lai không có quyền truy cập!");
                }

                String currentUsername = auth.getName();
                boolean isAdmin = auth.getAuthorities().stream()
                                .anyMatch(role -> role.getAuthority().equals("ROLE_ADMIN"));

                if (isAdmin || currentUsername.equals(news.getAuthor().getUsername())) {
                        return news;
                }

                throw new RuntimeException(
                                "Lỗi phân quyền: Bạn không có quyền xem bài viết chưa được duyệt của người khác!");
        }

        @Transactional(rollbackFor = Exception.class)
        public News createNews(NewsRequest request) throws Exception {
                String title = normalizeText(request.getTitle());
                String summary = normalizeOptionalText(request.getSummary());
                String content = normalizeText(request.getContent());
                MultipartFile image = request.getImage();

                String imageUrl = null;
                if (image != null && !image.isEmpty()) {
                        validateImage(image);
                        imageUrl = cloudinaryService.uploadImage(image);
                }

                summary = sanitizeHtml(summary);
                content = sanitizeHtml(content);

                String username = SecurityContextHolder.getContext().getAuthentication().getName();
                Account curentAccount = accountRepository.findByUsernameAndDeletedAtIsNull(username)
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                                                "Không tìm thấy tài khoản người đăng"));
                boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                                .stream().anyMatch(role -> role.getAuthority().equals("ROLE_ADMIN"));

                News news = News.builder()
                                .title(title)
                                .summary(summary)
                                .content(content)
                                .imageUrl(imageUrl)
                                .author(curentAccount)
                                .status(isAdmin ? NewsStatus.PUBLISHED : NewsStatus.PENDING)
                                .build();

                News savedNews = newsRepository.save(Objects.requireNonNull(news));

                if (savedNews.getStatus() == NewsStatus.PUBLISHED) {
                        messagingTemplate.convertAndSend("/topic/news", "NEW_NEWS_ADDED|" + savedNews.getTitle());
                }

                return savedNews;
        }

        @Transactional(rollbackFor = Exception.class)
        public News updateNews(Long id, NewsRequest request) throws Exception {
                String title = normalizeText(request.getTitle());
                String summary = normalizeOptionalText(request.getSummary());
                String content = normalizeText(request.getContent());
                MultipartFile image = request.getImage();

                String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

                boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                                .stream().anyMatch(role -> role.getAuthority().equals("ROLE_ADMIN"));

                News news = newsRepository.findById(Objects.requireNonNull(id))
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                                                "Không tìm thấy tin tức!"));

                String authorName = news.getAuthor().getUsername();

                if (!currentUsername.equals(authorName) && !isAdmin) {
                        throw new AppException(HttpStatus.FORBIDDEN,
                                        "Lỗi phân quyền: Bạn không có quyền sửa bài viết này");
                }

                if (!isAdmin && news.getStatus() == NewsStatus.PUBLISHED) {
                        news.setStatus(NewsStatus.PENDING);
                        messagingTemplate.convertAndSend("/topic/news",
                                        "NEWS_REMOVED_FROM_HOME|" + news.getNewsId());
                }

                summary = sanitizeHtml(summary);
                content = sanitizeHtml(content);

                news.setTitle(title);
                news.setSummary(summary);
                news.setContent(content);

                if (image != null && !image.isEmpty()) {
                        validateImage(image);
                        news.setImageUrl(cloudinaryService.uploadImage(image));
                }

                News updatedNews = newsRepository.save(Objects.requireNonNull(news));

                if (updatedNews.getStatus() == NewsStatus.PUBLISHED) {
                        messagingTemplate.convertAndSend("/topic/news", "NEWS_UPDATED|" + updatedNews.getNewsId());
                }

                return updatedNews;
        }

        @Transactional(rollbackFor = Exception.class)
        public void deleteNews(Long id) {
                String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

                boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                                .stream().anyMatch(role -> role.getAuthority().equals("ROLE_ADMIN"));

                News news = newsRepository.findById(Objects.requireNonNull(id))
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                                                "Không tìm thấy tin tức!"));

                String authorName = news.getAuthor().getUsername();

                if (!currentUsername.equals(authorName) && !isAdmin) {
                        throw new AppException(HttpStatus.FORBIDDEN,
                                        "Lỗi phân quyền: Bạn không có quyền xóa bài viết này");
                }

                news.setDeletedAt(new Date());

                newsRepository.save(Objects.requireNonNull(news));

                messagingTemplate.convertAndSend("/topic/news", "NEWS_DELETED|" + id);
        }

        public Page<News> getAllNewsForAdmin(int page, int size) {
                Pageable pageable = PageRequest.of(page, size);
                return newsRepository.findByDeletedAtIsNullOrderByCreatedAtDesc(pageable);
        }

        public Page<News> getMyNews(int page, int size) {
                Pageable pageable = PageRequest.of(page, size);
                String username = SecurityContextHolder.getContext().getAuthentication().getName();
                Account currentAccount = accountRepository.findByUsernameAndDeletedAtIsNull(username)
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                                                "Không tìm thấy tài khoản hiện tại"));

                return newsRepository.findByAuthorAccountIdOrderByCreatedAtDesc(currentAccount.getAccountId(),
                                pageable);
        }

        @Transactional(rollbackFor = Exception.class)
        public News changeNewsStatus(Long id, NewsStatus newStatus) {
                News news = newsRepository.findById(Objects.requireNonNull(id))
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                                                "Không tìm thấy tin tức!"));

                news.setStatus(newStatus);

                News updatedNews = newsRepository.save(Objects.requireNonNull(news));

                if (newStatus == NewsStatus.PUBLISHED) {
                        messagingTemplate.convertAndSend("/topic/news", "NEW_NEWS_ADDED|" + updatedNews.getTitle());
                }

                return updatedNews;
        }

        private String normalizeText(String value) {
                if (value == null) {
                        return null;
                }
                return value.trim();
        }

        private String normalizeOptionalText(String value) {
                if (value == null) {
                        return null;
                }
                return value.trim();
        }

        private String sanitizeHtml(String html) {
                if (html == null)
                        return null;
                Safelist customSafelist = Safelist.relaxed()
                                .addAttributes(":all", "style")
                                .addAttributes(":all", "class");

                return Jsoup.clean(html, customSafelist);
        }

        private void validateImage(MultipartFile image) {
                String contentType = image.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                        throw new AppException(HttpStatus.BAD_REQUEST,
                                        "File ảnh không hợp lệ, vui lòng tải lên file hình ảnh");
                }

                String originalFilename = image.getOriginalFilename();
                if (originalFilename == null || !originalFilename.contains(".")) {
                        throw new AppException(HttpStatus.BAD_REQUEST, "Tên file ảnh không hợp lệ");
                }

                String ext = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
                Set<String> allowedExt = Set.of("jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "tiff", "tif",
                                "heic");
                if (!allowedExt.contains(ext)) {
                        throw new AppException(HttpStatus.BAD_REQUEST,
                                        "Định dạng file không được hỗ trợ");
                }

                long maxSizeBytes = 5L * 1024 * 1024;
                if (image.getSize() > maxSizeBytes) {
                        throw new AppException(HttpStatus.BAD_REQUEST,
                                        "Dung lượng ảnh không được vượt quá 5MB");
                }
        }

        public Page<NewsListResponse> getStaffFeed(int page, int size) {
                Pageable pageable = PageRequest.of(page, size);

                String username = SecurityContextHolder.getContext().getAuthentication().getName();
                Account currentAccount = accountRepository.findByUsernameAndDeletedAtIsNull(username)
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                                                "Không tìm thấy tài khoản hiện tại"));

                Page<News> newsPage = newsRepository.findNewsForStaffFeed(currentAccount.getAccountId(), pageable);

                return newsPage.map(news -> NewsListResponse.builder()
                                .newsId(news.getNewsId())
                                .title(news.getTitle())
                                .summary(news.getSummary())
                                .imageUrl(news.getImageUrl())
                                .createdAt(news.getCreatedAt())
                                .author(news.getAuthor().getUsername())
                                .status(news.getStatus().name())
                                .build());
        }
}