package com.enfantTerrible.enfantTerrible.common.enums;

public enum AuthProvider {

  LOCAl,
  GOOGLE,
  NAVER;

  public static AuthProvider from(String value) {
    try {
      return AuthProvider.valueOf(value.toUpperCase());
    } catch (Exception e) {
      return null;
    }
  }
}
