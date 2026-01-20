package com.enfantTerrible.enfantTerrible.dto.admin.order;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminOrderItemCancelResponse {

  private Long orderId;
  private String orderStatus;

  private Long refundAmount;
  private Long remainingAmount;
}
