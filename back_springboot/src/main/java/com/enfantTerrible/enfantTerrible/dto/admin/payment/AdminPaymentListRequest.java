package com.enfantTerrible.enfantTerrible.dto.admin.payment;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPaymentListRequest {

  private int page = 1;
  private int size = 20;

  private String userEmail;
  private Long orderId;
  private String orderCode;
  private String paymentStatus;

  private Long minPaymentAmount;
  private Long maxPaymentAmount;

  private LocalDateTime paidFrom;
  private LocalDateTime paidTo;

  // 정렬 기준 (PAYMENT_ID / PAID_AT / CREATED_AT / PAYMENT_AMOUNT)
  private String sortBy;

  // 정렬 방향 (ASC / DESC)
  private String direction;

  public int getOffset() {
    return (page - 1) * size;
  }
}
