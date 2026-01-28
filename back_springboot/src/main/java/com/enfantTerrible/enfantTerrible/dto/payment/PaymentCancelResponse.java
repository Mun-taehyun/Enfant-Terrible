package com.enfantTerrible.enfantTerrible.dto.payment;

import com.enfantTerrible.enfantTerrible.common.enums.PaymentStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentCancelResponse {

  private Long paymentId;
  private Long orderId;

  private PaymentStatus paymentStatus;

  private String pgTid;
  private String cancelledAt;
}
