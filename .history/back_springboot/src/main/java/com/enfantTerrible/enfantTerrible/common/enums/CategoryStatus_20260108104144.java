package com.enfantTerrible.enfantTerrible.common.enums;

public enum CategoryStatus {
  Y,
  N;

  public static CategoryStatus from(String value) {
    try {
      return CategoryStatus.valueOf(value);
    } catch (Exception e) {
      return N;
    }
  }
}
