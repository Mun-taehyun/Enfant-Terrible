package com.enfantTerrible.enfantTerrible.dto.admin.product;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductListRequest {

  // 페이지 번호 (1부터 시작)
  private Integer page;

  // 페이지 크기
  private Integer size;

  // 상품명 검색
  private String keyword;

  // 상품 코드 검색
  private String productCode;

  // 상품 상태 (ON_SALE / STOPPED / HIDDEN / SOLD_OUT)
  private String status;

  private Long categoryId;

  private Long minPrice;
  private Long maxPrice;

  private LocalDateTime createdFrom;
  private LocalDateTime createdTo;

  // 정렬 기준 (PRODUCT_ID / CREATED_AT / BASE_PRICE / NAME)
  private String sortBy;

  // 정렬 방향 (ASC / DESC)
  private String direction;
}
