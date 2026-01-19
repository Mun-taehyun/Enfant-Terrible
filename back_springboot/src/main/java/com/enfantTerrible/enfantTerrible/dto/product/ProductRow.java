package com.enfantTerrible.enfantTerrible.dto.product;

import java.time.LocalDateTime;

import com.enfantTerrible.enfantTerrible.common.enums.ProductStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductRow {

  private Long productId;
  private Long categoryId;
  private String categoryName;

  private String name;
  private String description;

  // ⭐ 최저 SKU 가격
  private Long minSkuPrice;

  private Float averageRating;
  private Integer reviewCount;

  private ProductStatus status;
  private LocalDateTime createdAt; // 정렬용
}
