package com.enfantTerrible.enfantTerrible.common.enums;

public enum AuthProvider {

  LOCAL,
  GOOGLE,
  NAVER;

  public static AuthProvider from(String value) {
    if (value == null) {
      return LOCAL;
    }
    try {
      return AuthProvider.valueOf(value.trim().toUpperCase());
    } catch (Exception e) {
      return LOCAL;
    }
  }
}
