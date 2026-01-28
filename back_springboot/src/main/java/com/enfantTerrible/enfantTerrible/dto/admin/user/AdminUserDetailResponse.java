package com.enfantTerrible.enfantTerrible.dto.admin.user;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUserDetailResponse {

  private Long userId;
  private String email;
  private String name;
  private String tel;

  private String role;
  private String status;
  private String provider;

  private Boolean emailVerified;

  private LocalDateTime createdAt;
  private LocalDateTime lastLoginAt;

  /**
   * 반려동물 정보 (추천용 사용자 속성)
   */
  private List<AdminUserPetResponse> pets;
}
