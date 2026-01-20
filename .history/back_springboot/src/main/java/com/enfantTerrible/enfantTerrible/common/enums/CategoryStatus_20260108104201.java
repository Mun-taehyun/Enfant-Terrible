package com.enfantTerrible.enfantTerrible.common.enums;

public enum CategoryStatus {
  Y, N;

  public static CategoryStatus from(String value) {
    if (value == null) {
      return N;
    }
    try {
      return CategoryStatus.valueOf(value);
    } catch (Exception e) {
      return N;
    }
  }

  public boolean isActive() {
    return this == Y;
  }
}