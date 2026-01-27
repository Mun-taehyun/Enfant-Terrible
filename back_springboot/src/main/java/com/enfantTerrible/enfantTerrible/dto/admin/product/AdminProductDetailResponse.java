package com.enfantTerrible.enfantTerrible.dto.admin.product;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductDetailResponse {

  private Long productId;
  private String productCode;

  private String name;
  private String description;
  private Long basePrice;
  private String status;

  private Long categoryId;
  private String categoryName;

  private LocalDateTime createdAt;

  // 연결된 이미지 목록
  private List<ProductImageResponse> images;
}
