package com.enfantTerrible.enfantTerrible.dto.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentCancelRequest {

  @NotBlank
  private String paymentId;

  // 우리 시스템 주문 코드(=orderCode)
  @NotBlank
  private String orderId;

  // 전액 취소는 amount를 null로 보내도 되지만, 서버 검증을 위해 받음
  @NotNull
  private Long amount;

  private String reason;
}
