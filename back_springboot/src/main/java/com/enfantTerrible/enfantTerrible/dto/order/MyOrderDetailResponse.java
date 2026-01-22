package com.enfantTerrible.enfantTerrible.dto.order;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MyOrderDetailResponse {

  private Long orderId;
  private String orderCode;
  private String status;
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

  private List<MyOrderItemResponse> items;
}
