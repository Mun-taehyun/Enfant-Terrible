package com.enfantTerrible.enfantTerrible.dto.order;

import java.time.LocalDateTime;

import com.enfantTerrible.enfantTerrible.common.enums.OrderStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MyOrderDetailRow {

  private Long orderId;
  private Long userId;
  private String orderCode;
  private OrderStatus orderStatus;
  private Long totalAmount;

  private String receiverName;
  private String receiverPhone;
  private String zipCode;
  private String addressBase;
  private String addressDetail;

  private String trackingNumber;
  private LocalDateTime orderedAt;
  private LocalDateTime shippedAt;
  private LocalDateTime deliveredAt;
}
