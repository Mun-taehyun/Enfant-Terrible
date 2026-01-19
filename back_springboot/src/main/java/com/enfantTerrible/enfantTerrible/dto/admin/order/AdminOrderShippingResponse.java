package com.enfantTerrible.enfantTerrible.dto.admin.order;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminOrderShippingResponse {

  private Long orderId;
  private String status;

  private String trackingNumber;
  private LocalDateTime shippedAt;
}
