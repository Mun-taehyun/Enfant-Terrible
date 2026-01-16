package com.enfantTerrible.enfantTerrible.dto.admin.product;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminSkuSaveInternalRequest {

  private Long productId;
  private String skuCode;
  private Long price;
  private Long stock;
  private String status;
}
