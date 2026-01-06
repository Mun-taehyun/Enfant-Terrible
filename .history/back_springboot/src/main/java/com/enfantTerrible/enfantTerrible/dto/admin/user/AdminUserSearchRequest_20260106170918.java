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

  public int getOffset() {
    return (page - 1) * size;
  }
}

