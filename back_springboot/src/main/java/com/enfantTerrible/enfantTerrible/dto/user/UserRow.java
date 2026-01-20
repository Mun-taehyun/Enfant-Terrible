package com.enfantTerrible.enfantTerrible.dto.user;

import java.time.LocalDateTime;

import com.enfantTerrible.enfantTerrible.common.enums.EmailVerifiedStatus;
import com.enfantTerrible.enfantTerrible.common.enums.UserRole;
import com.enfantTerrible.enfantTerrible.common.enums.UserStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserRow {
  private Long userId;
  private String email;
  private String password;
  private String name;
  private String tel;
  private String zipCode;
  private String addressBase;
  private String addressDetail;
  private EmailVerifiedStatus emailVerified;

  private UserRole role;
  private String provider;   // local, google, naver
  private UserStatus status;

  private LocalDateTime lastLoginAt;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private LocalDateTime passwordUpdatedAt;
  private LocalDateTime deletedAt;
}
