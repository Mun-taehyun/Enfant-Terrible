package com.enfantTerrible.enfantTerrible.common.enums;

public enum OrderStatus {

  ORDERED,
  PAYMENT_PENDING,
  PAID,
  PARTIALLY_CANCELLED,
  SHIPPING,
  DELIVERED,
  CANCELLED;

  public static OrderStatus from(String value) {
    for (OrderStatus s : values()) {
      if (s.name().equals(value)) {
        return s;
      }
    }
    throw new IllegalArgumentException("Invalid order status: " + value);
  }
}
