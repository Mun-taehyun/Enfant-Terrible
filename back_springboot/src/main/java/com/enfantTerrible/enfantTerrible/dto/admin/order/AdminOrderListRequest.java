package com.enfantTerrible.enfantTerrible.dto.admin.order;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminOrderListRequest {

  private int page = 1;
  private int size = 20;

  private String userEmail;
  private String orderCode;
  private String status;

  private Long minTotalAmount;
  private Long maxTotalAmount;

  private LocalDateTime shippedFrom;
  private LocalDateTime shippedTo;
  private LocalDateTime deliveredFrom;
  private LocalDateTime deliveredTo;

  // 정렬 기준 (ORDER_ID / TOTAL_AMOUNT / SHIPPED_AT / DELIVERED_AT)
  private String sortBy;

  // 정렬 방향 (ASC / DESC)
  private String direction;

  public int getOffset() {
    return (page - 1) * size;
  }
}
