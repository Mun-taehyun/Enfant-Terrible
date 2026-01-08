package com.enfantTerrible.enfantTerrible.common.enums;

public enum UserStatus {

  ACTIVE,     // 정상
  SUSPENDED,  // 정지
  DELETED;    // 탈퇴

  /**
   * DB 문자열 → enum 안전 변환
   */
  public static UserStatus from(String value) {
    try {
      return UserStatus.valueOf(value);
    } catch (Exception e) {
      return SUSPENDED;
    }
  }
}
