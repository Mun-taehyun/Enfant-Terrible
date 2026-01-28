package com.enfantTerrible.enfantTerrible.common.enums;

public enum PaymentMethod {

  CARD,
  NAVERPAY,
  KAKAOPAY,
  TOSSPAY,
  TRANSFER,
  VIRTUAL_ACCOUNT,
  MOBILE;

  public static PaymentMethod from(String value) {
    if (value == null) {
      return null;
    }
    for (PaymentMethod m : values()) {
      if (m.name().equals(value)) {
        return m;
      }
    }
    throw new IllegalArgumentException("Invalid payment method: " + value);
  }
}
