package com.enfantTerrible.enfantTerrible.dto.admin.order;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminOrderItemResponse {

  private Long skuId;
  private String productName;
  private Long price;
  private Integer quantity;
}
