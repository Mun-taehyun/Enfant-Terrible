package com.enfantTerrible.enfantTerrible.dto.admin.product;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminSkuListRequest {

  private Integer page;
  private Integer size;

  private Long productId;
  private String status;

  private Long minPrice;
  private Long maxPrice;

  private Integer minStock;
  private Integer maxStock;

  // 정렬 기준 (SKU_ID / CREATED_AT / PRICE / STOCK)
  private String sortBy;

  // 정렬 방향 (ASC / DESC)
  private String direction;
}
