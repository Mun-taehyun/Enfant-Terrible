package com.enfantTerrible.enfantTerrible.dto.admin.payment;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPaymentCancelRequest {

  @NotNull
  private Long amount;

  private String reason;
}
