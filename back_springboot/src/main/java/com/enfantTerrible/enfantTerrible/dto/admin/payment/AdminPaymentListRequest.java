package com.enfantTerrible.enfantTerrible.dto.admin.payment;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPaymentListRequest {

  private int page = 1;
  private int size = 20;

  private Long userId;
  private Long orderId;
  private String orderCode;
  private String paymentStatus;

  public int getOffset() {
    return (page - 1) * size;
  }
}
