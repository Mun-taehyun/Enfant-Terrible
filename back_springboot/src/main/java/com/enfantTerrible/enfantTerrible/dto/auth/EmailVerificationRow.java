package com.enfantTerrible.enfantTerrible.dto.auth;

import java.time.LocalDateTime;

import com.enfantTerrible.enfantTerrible.common.enums.EmailVerificationPurpose;

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
  private EmailVerificationPurpose purpose;

  private LocalDateTime createdAt;
  private LocalDateTime expiresAt;
  private LocalDateTime verifiedAt;
}
