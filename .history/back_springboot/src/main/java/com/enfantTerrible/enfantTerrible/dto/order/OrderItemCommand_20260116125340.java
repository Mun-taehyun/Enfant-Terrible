package com.enfantTerrible.enfantTerrible.dto.order;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderItemCommand {

  private Long skuId;
  private Long price;
  private Integer quantity;
  private String productName;
}
