package com.enfantTerrible.enfantTerrible.dto.admin.order;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminOrderDetailResponse {

  private Long orderId;
  private Long userId;
  private String orderCode;
  private String status;
  private Long totalAmount;

  private String receiverName;
  private String receiverPhone;
  private String zipCode;
  private String addressBase;
  private String addressDetail;

  private String trackingNumber;
  private LocalDateTime shippedAt;
  private LocalDateTime deliveredAt;

  private List<AdminOrderItemResponse> items;
}
