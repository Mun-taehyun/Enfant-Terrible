package com.enfantTerrible.enfantTerrible.common.enums;

import java.util.Arrays;

import com.enfantTerrible.enfantTerrible.exception.BusinessException;

public enum ProductStatus {

  ON_SALE("판매중"),
  STOPPED("판매중지"),
  SOLD_OUT("품절"),
  HIDDEN("비노출");

  private final String description;

  ProductStatus(String description) {
    this.description = description;
  }

  public String getDescription() {
    return description;
  }

  public static ProductStatus from(String value) {
    return Arrays.stream(values())
        .filter(v -> v.name().equals(value))
        .findFirst()
        .orElseThrow(() ->
            new BusinessException("유효하지 않은 상품 상태입니다: " + value)
        );
  }
}
