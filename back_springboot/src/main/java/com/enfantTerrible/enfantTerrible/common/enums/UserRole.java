package com.enfantTerrible.enfantTerrible.common.enums;

public enum UserRole {

  USER,
  ADMIN;

  /**
   * Spring Security용 ROLE 문자열
   */
  public String getSecurityRole() {
    return "ROLE_" + this.name();
  }

   public static UserRole from(String value) {
    if (value == null) {
      return USER;
    }
    try {
      return UserRole.valueOf(value.trim().toUpperCase());
    } catch (Exception e) {
      return USER; // 기본값
    }
  }
}
