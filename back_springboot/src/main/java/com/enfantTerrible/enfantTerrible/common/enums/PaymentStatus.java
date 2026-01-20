package com.enfantTerrible.enfantTerrible.common.enums;

public enum PaymentStatus {

  READY,
  SUCCESS,
  FAIL,
  REFUND;

  public static PaymentStatus from(String value) {
    if (value == null) {
      return null;
    }
    for (PaymentStatus s : values()) {
      if (s.name().equals(value)) {
        return s;
      }
    }
    throw new IllegalArgumentException("Invalid payment status: " + value);
  }
}
