package com.enfantTerrible.enfantTerrible.dto.admin.post;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPostListRequest {

  private int page = 1;
  private int size = 20;

  private String postType;
  private Long userId;

  public int getOffset() {
    return (page - 1) * size;
  }
}
