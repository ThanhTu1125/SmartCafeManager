package com.codegym.backend.dto;

import java.math.BigDecimal;

public interface ItemProjection {
    Long getItemId();

    String getItemCode();

    Long getCategoryId();

    String getCategoryName();

    String getItemName();

    BigDecimal getPrice();

    String getDescription();

    String getImageUrl();

    Boolean getIsAvailable();
    
    Long getTotalOrderCount();
}