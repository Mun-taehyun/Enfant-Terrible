package com.enfantTerrible.enfantTerrible.dto.admin.order;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminOrderListResponse {

  private Long orderId;
  private Long userId;
  private String orderCode;
  private String status;
  private Long totalAmount;

  private String receiverName;
  private String receiverPhone;
}
