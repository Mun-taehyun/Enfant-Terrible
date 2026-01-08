package com.enfantTerrible.enfantTerrible.common.enums;

public enum CategoryStatus {
  ACTIVE,
  INACTIVE;

  public static CategoryStatus from(String value) {
    try {
      return CategoryStatus.valueOf(value);
    } catch (Exception e) {
      return INACTIVE;
    }
  }
}
