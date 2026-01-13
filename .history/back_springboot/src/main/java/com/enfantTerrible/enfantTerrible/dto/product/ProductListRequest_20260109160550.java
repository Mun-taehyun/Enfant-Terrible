package com.enfantTerrible.enfantTerrible.dto.product;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductListRequest {

  /* ========================
   * Paging (판단은 Service)
   * ======================== */
  private Integer page;
  private Integer size;

  /* ========================
   * Filtering
   * ======================== */
  private Long categoryId;     // 카테고리 필터

  /* ========================
   * Search
   * ======================== */
  private String keyword;      // 상품명 검색 (LIKE)

  /* ========================
   * Sorting
   * ======================== */
  private String sort;         // 정렬 기준 (Service에서 해석)
}
