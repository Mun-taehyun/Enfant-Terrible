package com.enfantTerrible.enfantTerrible.dto.product;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductResponse {

  private Long productId;
  private Long categoryId;
  private String categoryName;

  private String name;
  private String description;

  // ⭐ 최저 SKU 가격
  private Long price;

  private String discountType;
  private Integer discountValue;
  private Long discountedPrice;

  private Float averageRating;
  private Integer reviewCount;

  private String thumbnailUrl;
}
