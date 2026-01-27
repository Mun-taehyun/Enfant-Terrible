package com.enfantTerrible.enfantTerrible.dto.admin.user;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUserListResponse {

  private Long userId;
  private String email;
  private String name;

  private String role;        // USER / ADMIN
  private String status;      // ACTIVE / SUSPENDED / DELETED
  private String provider;    // LOCAL / GOOGLE / NAVER

  private LocalDateTime createdAt;
  private LocalDateTime lastLoginAt;
}
