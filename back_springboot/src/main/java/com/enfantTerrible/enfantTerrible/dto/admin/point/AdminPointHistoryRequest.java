package com.enfantTerrible.enfantTerrible.dto.admin.point;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPointHistoryRequest {

  private int page = 1;
  private int size = 20;

  // 정렬 기준 (POINT_HISTORY_ID / CREATED_AT)
  private String sortBy;

  // 정렬 방향 (ASC / DESC)
  private String direction;

  public int getOffset() {
    return (page - 1) * size;
  }
}
