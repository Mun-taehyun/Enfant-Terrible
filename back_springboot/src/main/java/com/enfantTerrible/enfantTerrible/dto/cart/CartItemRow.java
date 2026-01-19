package com.enfantTerrible.enfantTerrible.dto.cart;

import com.enfantTerrible.enfantTerrible.common.enums.SkuStatus;
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
  private SkuStatus skuStatus;

  private Integer quantity;
}
