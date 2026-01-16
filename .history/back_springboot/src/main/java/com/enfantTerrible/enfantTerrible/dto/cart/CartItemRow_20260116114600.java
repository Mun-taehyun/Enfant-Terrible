package com.enfantTerrible.enfantTerrible.dto.cart;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemRow {

  private Long cartItemId;

  private Long skuId;
  private Long productId;

  private String productName;

  private Long price;
  private Long stock;
  private String skuStatus;

  private Integer quantity;
}
