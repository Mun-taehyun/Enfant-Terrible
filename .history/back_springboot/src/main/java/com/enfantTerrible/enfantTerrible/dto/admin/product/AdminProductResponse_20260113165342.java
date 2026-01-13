package com.enfantTerrible.enfantTerrible.dto.admin.product;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductResponse {

  private Long productId;
  private String productCode;

  private Long categoryId;
  private String categoryName;

  private String name;
  private Long basePrice;
  private String status;

  private String thumbnailUrl;
}
