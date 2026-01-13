package com.enfantTerrible.enfantTerrible.common.enums;

import com.enfantTerrible.enfantTerrible.exception.BusinessException;

public enum EmailVerifiedStatus {

  Y,  // 인증됨
  N;  // 미인증

  public static EmailVerifiedStatus from(String value) {
    if (value == null) {
      return N; // 기본 미인증
    }
    try {
      return EmailVerifiedStatus.valueOf(value);
    } catch (Exception e) {
      throw new BusinessException("이메일 인증 여부 값이 올바르지 않습니다: " + value);
    }
  }

  public boolean isVerified() {
    return this == Y;
  }
}
