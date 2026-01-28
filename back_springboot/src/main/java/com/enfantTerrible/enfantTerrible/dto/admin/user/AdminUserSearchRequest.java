package com.enfantTerrible.enfantTerrible.dto.admin.user;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUserSearchRequest {

  // paging
  private int page = 1;
  private int size = 20;

  // search
  private String email;
  private String name;
  private String status;
  private String provider;

  private LocalDateTime createdFrom;
  private LocalDateTime createdTo;

  // 정렬 기준 (USER_ID / CREATED_AT / LAST_LOGIN_AT)
  private String sortBy;

  // 정렬 방향 (ASC / DESC)
  private String direction;

  public int getOffset() {
    return (page - 1) * size;
  }
}

