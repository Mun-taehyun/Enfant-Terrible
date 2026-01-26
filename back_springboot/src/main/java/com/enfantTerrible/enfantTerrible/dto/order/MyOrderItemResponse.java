package com.enfantTerrible.enfantTerrible.dto.order;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MyOrderItemResponse {

  private Long skuId;
  private String productName;
  private Long price;
  private Integer quantity;
  private Integer cancelledQuantity;
  private Integer remainingQuantity;
}
