package com.enfantTerrible.enfantTerrible.dto.cart;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartSkuRow {

  private Long skuId;
  private Long productId;

  private Long price;
  private Long stock;
  private String skuStatus;
}
