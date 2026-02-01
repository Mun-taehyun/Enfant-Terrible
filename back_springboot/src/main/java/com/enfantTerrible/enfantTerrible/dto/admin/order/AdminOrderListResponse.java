package com.enfantTerrible.enfantTerrible.dto.admin.order;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminOrderListResponse {

  private Long orderId;
  private Long userId;
  private String userEmail;
  private String orderCode;
  private String status;
  private Long totalAmount;

  private String receiverName;
  private String receiverPhone;

  private String firstProductName;
  private Integer itemCount;

  private String trackingNumber;
  private LocalDateTime shippedAt;
  private LocalDateTime deliveredAt;
}
