package com.enfantTerrible.enfantTerrible.common.enums;

public enum CategoryStatus {
  ACTIVE("Y"),
  INACTIVE("N");

  private final String code;

  CategoryStatus(String code) {
    this.code = code;
  }

  public String getCode() {
    return code;
  }

  public static CategoryStatus fromCode(String code) {
    if (code == null) {
      return INACTIVE; // 기본 비활성
    }
    for (CategoryStatus status : values()) {
      if (status.code.equals(code)) {
        return status;
      }
    }
    return INACTIVE;
  }

  public static CategoryStatus from(String value) {
    return fromCode(value);
  }

  public boolean isActive() {
    return this == ACTIVE;
  }

  public boolean isInactive() {
    return this == INACTIVE;
  }
}
