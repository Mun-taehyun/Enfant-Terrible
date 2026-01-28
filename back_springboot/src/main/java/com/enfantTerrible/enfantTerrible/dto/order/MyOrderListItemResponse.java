package com.enfantTerrible.enfantTerrible.dto.order;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MyOrderListItemResponse {

  private Long orderId;
  private String orderCode;
  private String status;
  private Long totalAmount;

  private String representativeProductName;
  private String representativeThumbnailUrl;

  private String trackingNumber;
  private LocalDateTime orderedAt;
  private LocalDateTime shippedAt;
  private LocalDateTime deliveredAt;
}
