package com.enfantTerrible.enfantTerrible.dto.product;

import com.enfantTerrible.enfantTerrible.common.enums.SkuStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductSkuResolveResponse {

  private Long skuId;
  private Long price;
  private Long stock;
  private SkuStatus status;
}
