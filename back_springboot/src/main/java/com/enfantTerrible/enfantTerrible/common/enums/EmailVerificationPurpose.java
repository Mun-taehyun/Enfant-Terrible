package com.enfantTerrible.enfantTerrible.common.enums;

public enum EmailVerificationPurpose {
  SIGNUP("signup", "회원가입"),
  PASSWORD_RESET("reset_password", "비밀번호 재설정");

  private final String code;
  private final String description;

  EmailVerificationPurpose(String code, String description) {
    this.code = code;
    this.description = description;
  }

  public String getCode() {
    return code;
  }

  public String getDescription() {
    return description;
  }

  public static EmailVerificationPurpose fromCode(String code) {
    if (code == null) {
      return null;
    }
    for (EmailVerificationPurpose purpose : values()) {
      if (purpose.code.equals(code)) {
        return purpose;
      }
    }
    return null;
  }

  public static EmailVerificationPurpose from(String value) {
    return fromCode(value);
  }
}
