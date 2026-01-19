package com.enfantTerrible.enfantTerrible.dto.admin.point;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPointHistoryRequest {

  private int page = 1;
  private int size = 20;

  public int getOffset() {
    return (page - 1) * size;
  }
}
