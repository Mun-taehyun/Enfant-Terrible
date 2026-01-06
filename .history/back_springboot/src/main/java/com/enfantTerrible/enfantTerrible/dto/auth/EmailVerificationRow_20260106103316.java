package com.enfantTerrible.enfantTerrible.dto.auth;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationRow {
  private Long emailVerificationId;
  private String email;
  private String verificationCode;
  private String purpose;       // signup, password_reset

  private LocalDateTime createdAt;
  private LocalDateTime expiredAt;
  private LocalDateTime verifiedAt;
}
