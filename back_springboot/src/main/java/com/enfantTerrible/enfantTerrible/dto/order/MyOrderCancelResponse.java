package com.enfantTerrible.enfantTerrible.dto.order;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MyOrderCancelResponse {

  private Long orderId;
  private String orderStatus;

  private Long refundAmount;
  private Long remainingAmount;
}
