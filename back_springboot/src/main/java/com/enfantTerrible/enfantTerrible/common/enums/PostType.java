package com.enfantTerrible.enfantTerrible.common.enums;

public enum PostType {
  NOTICE,
  PRODUCT_DETAIL,
  EVENT;

  public static PostType from(String value) {
    if (value == null) {
      return null;
    }
    try {
      return PostType.valueOf(value.trim().toUpperCase());
    } catch (Exception e) {
      return null;
    }
  }
}
