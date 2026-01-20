package com.enfantTerrible.enfantTerrible.dto.product;

import java.time.LocalDateTime;

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

  private Long basePrice;

  private String status;
  private LocalDateTime deletedAt;
  private LocalDateTime createdAt; // 정렬용
}
