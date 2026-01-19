package com.enfantTerrible.enfantTerrible.dto.order;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderCreateResponse {

  private Long orderId;
  private String orderCode;
  private Long totalAmount;
}
