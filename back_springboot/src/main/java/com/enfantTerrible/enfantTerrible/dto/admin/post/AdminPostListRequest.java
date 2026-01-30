package com.enfantTerrible.enfantTerrible.dto.admin.post;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPostListRequest {

  private int page = 1;
  private int size = 20;

  private String postType;
  private String userEmail;

  private String keyword;
  private LocalDateTime createdFrom;
  private LocalDateTime createdTo;

  // 정렬 기준 (POST_ID / CREATED_AT / UPDATED_AT)
  private String sortBy;

  // 정렬 방향 (ASC / DESC)
  private String direction;

  public int getOffset() {
    return (page - 1) * size;
  }
}
