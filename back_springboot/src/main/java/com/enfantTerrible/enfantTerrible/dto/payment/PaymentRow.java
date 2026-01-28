package com.enfantTerrible.enfantTerrible.dto.payment;

import java.time.LocalDateTime;

import com.enfantTerrible.enfantTerrible.common.enums.PaymentMethod;
import com.enfantTerrible.enfantTerrible.common.enums.PaymentStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentRow {

  private Long paymentId;
  private Long orderId;

  private PaymentMethod paymentMethod;
  private Long paymentAmount;
  private PaymentStatus paymentStatus;

  private String pgTid;
  private LocalDateTime paidAt;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
