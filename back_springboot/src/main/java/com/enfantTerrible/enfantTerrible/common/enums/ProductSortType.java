package com.enfantTerrible.enfantTerrible.common.enums;

import com.enfantTerrible.enfantTerrible.exception.BusinessException;

public enum ProductSortType {

  RECENT("최신순"),
  PRICE_ASC("가격 낮은 순"),
  PRICE_DESC("가격 높은 순"),
  NAME("이름순");

  private final String description;

  ProductSortType(String description) {
    this.description = description;
  }

  public String getDescription() {
    return description;
  }

  /**
   * 요청 파라미터 → 정렬 enum 변환
   * null 이면 기본값 RECENT
   */
  public static ProductSortType from(String value) {
    if (value == null || value.isBlank()) {
      return RECENT;
    }

    try {
      return ProductSortType.valueOf(value.trim().toUpperCase());
    } catch (Exception e) {
      throw new BusinessException("지원하지 않는 상품 정렬 방식입니다: " + value);
    }
  }
}
