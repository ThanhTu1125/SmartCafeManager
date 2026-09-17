package com.codegym.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.codegym.backend.entity.News;
import com.codegym.backend.enums.NewsStatus;

import io.lettuce.core.dynamic.annotation.Param;

public interface NewsRepository extends JpaRepository<News, Long> {
    Page<News> findByDeletedAtIsNullOrderByCreatedAtDesc(Pageable pageable);

    Page<News> findByStatusAndDeletedAtIsNullOrderByCreatedAtDesc(NewsStatus status, Pageable pageable);

    Page<News> findByAuthorAccountIdOrderByCreatedAtDesc(Long accountId, Pageable pageable);

    @Query("SELECT n FROM News n WHERE (n.author.accountId = :accountId OR n.status = 'PUBLISHED') AND n.deletedAt IS NULL ORDER BY n.createdAt DESC")
    Page<News> findNewsForStaffFeed(@Param("accountId") Long accountId, Pageable pageable);
}