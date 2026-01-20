package com.enfantTerrible.enfantTerrible.common.enums;

public enum EmailVerifiedStatus {

  Y,  // 인증됨
  N;  // 미인증

  public boolean isVerified() {
    return this == Y;
  }
}
