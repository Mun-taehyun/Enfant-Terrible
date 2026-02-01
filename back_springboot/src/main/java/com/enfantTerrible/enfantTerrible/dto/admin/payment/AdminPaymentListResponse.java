package com.enfantTerrible.enfantTerrible.dto.admin.payment;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPaymentListResponse {

  private Long paymentId;
  private Long orderId;
  private Long userId;
  private String userEmail;
  private String orderCode;

  private String paymentMethod;
  private Long paymentAmount;
  private String paymentStatus;

  private String pgTid;
  private LocalDateTime paidAt;
  private LocalDateTime createdAt;
}
