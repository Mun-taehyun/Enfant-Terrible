package com.enfantTerrible.enfantTerrible.common.enums;

public enum AuthProvider {

  local,
  google,
  naver;

  public static AuthProvider from(String value) {
    try {
      return AuthProvider.valueOf(value);
    } catch (Exception e) {
      return null;
    }
  }
}
