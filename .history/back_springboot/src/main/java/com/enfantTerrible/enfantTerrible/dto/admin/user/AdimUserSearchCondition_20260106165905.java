package com.enfantTerrible.enfantTerrible.dto.admin.user;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUserSearchCondition {

  private String email;      // 부분 검색
  private String name;       // 부분 검색

  private String status;     // ACTIVE / SUSPENDED / DELETED
  private String provider;   // LOCAL / GOOGLE / NAVER

  private LocalDateTime createdFrom;
  private LocalDateTime createdTo;
}
