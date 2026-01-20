package com.enfantTerrible.enfantTerrible.dto.product;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductSkuResolveResponse {

  private Long skuId;
  private Long price;
  private Long stock;
  private String status;
}
