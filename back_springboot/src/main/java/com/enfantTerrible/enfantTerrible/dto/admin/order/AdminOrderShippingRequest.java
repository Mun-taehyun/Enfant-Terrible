package com.enfantTerrible.enfantTerrible.dto.admin.order;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminOrderShippingRequest {

  @NotBlank
  private String trackingNumber;
}
