package com.enfantTerrible.enfantTerrible.dto.admin.product;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductRow {

  private Long productId;
  private String productCode;

  private String name;
  private Long basePrice;

  private String status;

  private Long categoryId;
  private String categoryName;

  private LocalDateTime createdAt;
}
