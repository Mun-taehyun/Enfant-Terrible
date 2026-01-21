package com.enfantTerrible.enfantTerrible.dto.admin.banner;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminBannerListRequest {

  private int page = 1;
  private int size = 20;

  private String title;
  private Boolean isActive;

  // 정렬 기준 (SORT_ORDER / BANNER_ID / CREATED_AT)
  private String sortBy;

  // 정렬 방향 (ASC / DESC)
  private String direction;

  public int getOffset() {
    return (page - 1) * size;
  }
}
