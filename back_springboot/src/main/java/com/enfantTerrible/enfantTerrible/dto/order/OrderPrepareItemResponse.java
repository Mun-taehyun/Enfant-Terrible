package com.enfantTerrible.enfantTerrible.dto.order;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderPrepareItemResponse {

  private Long skuId;
  private Long productId;

  private String productName;
  private Long price;
  private Integer quantity;

  private String thumbnailUrl;
  private List<Long> optionValueIds;

  private Boolean isBuyable;
  private String buyableReason;
}
