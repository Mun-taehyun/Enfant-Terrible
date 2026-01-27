package com.enfantTerrible.enfantTerrible.common.enums;

import java.util.Arrays;

import com.enfantTerrible.enfantTerrible.exception.BusinessException;

public enum SkuStatus {

  ON_SALE("판매중"),
  SOLD_OUT("품절"),
  STOPPED("판매중지");

  private final String description;

  SkuStatus(String description) {
    this.description = description;
  }

  public String getDescription() {
    return description;
  }

  public static SkuStatus from(String value) {
    if (value != null && "OFF_SALE".equalsIgnoreCase(value.trim())) {
      return STOPPED;
    }
    return Arrays.stream(values())
        .filter(v -> v.name().equals(value))
        .findFirst()
        .orElseThrow(() ->
            new BusinessException("유효하지 않은 SKU 상태입니다: " + value)
        );
  }
}
