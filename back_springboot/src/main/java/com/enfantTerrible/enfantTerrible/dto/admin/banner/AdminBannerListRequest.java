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

  public int getOffset() {
    return (page - 1) * size;
  }
}
