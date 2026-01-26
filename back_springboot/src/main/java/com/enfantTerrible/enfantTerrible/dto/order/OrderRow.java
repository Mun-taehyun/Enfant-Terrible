package com.enfantTerrible.enfantTerrible.dto.order;

import com.enfantTerrible.enfantTerrible.common.enums.OrderStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderRow {

  private Long orderId;
  private Long userId;
  private String orderCode;
  private OrderStatus orderStatus;

  private Long originalAmount;
  private Integer usedPoint;
  private Integer usedPointRefunded;

  private Long totalAmount;
}
