package com.enfantTerrible.enfantTerrible.dto.admin.order;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminOrderListRequest {

  private int page = 1;
  private int size = 20;

  private Long userId;
  private String orderCode;
  private String status;

  public int getOffset() {
    return (page - 1) * size;
  }
}
