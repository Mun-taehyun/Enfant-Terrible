package com.enfantTerrible.enfantTerrible.common.enums;

import java.util.Arrays;

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
    return Arrays.stream(values())
        .filter(v -> v.name().equals(value))
        .findFirst()
        .orElseThrow(() ->
            new IllegalArgumentException("유효하지 않은 SKU 상태입니다: " + value)
        );
  }
}
