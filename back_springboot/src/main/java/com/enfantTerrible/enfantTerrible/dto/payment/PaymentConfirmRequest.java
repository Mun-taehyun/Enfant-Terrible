package com.enfantTerrible.enfantTerrible.dto.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentConfirmRequest {

  @NotBlank
  private String paymentId;

  // TossPayments의 orderId (우리 시스템에서는 orderCode 사용 권장)
  @NotBlank
  private String orderId;

  @NotNull
  private Long amount;
}
