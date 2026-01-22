package com.enfantTerrible.enfantTerrible.dto.order;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderPrepareResponse {

  private Long userId;

  private String receiverName;
  private String receiverPhone;

  private String zipCode;
  private String addressBase;
  private String addressDetail;

  private Long totalAmount;
  private List<OrderPrepareItemResponse> items;
}
