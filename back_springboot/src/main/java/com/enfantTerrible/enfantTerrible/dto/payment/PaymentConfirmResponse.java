package com.enfantTerrible.enfantTerrible.dto.payment;

import com.enfantTerrible.enfantTerrible.common.enums.PaymentMethod;
import com.enfantTerrible.enfantTerrible.common.enums.PaymentStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentConfirmResponse {

  private Long paymentId;
  private Long orderId;

  private PaymentStatus paymentStatus;
  private PaymentMethod paymentMethod;
  private Long paymentAmount;

  private String pgTid;
  private String paidAt;
}
