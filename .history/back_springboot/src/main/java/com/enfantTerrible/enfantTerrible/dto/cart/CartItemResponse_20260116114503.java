package com.enfantTerrible.enfantTerrible.dto.cart;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemResponse {

  private Long cartItemId;

  private Long skuId;
  private Long productId;

  private String productName;
  private String thumbnailUrl;

  private Long price;
  private Long stock;
  private String skuStatus;

  private Integer quantity;

  private List<Long> optionValueIds;
}
