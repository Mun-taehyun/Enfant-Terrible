package com.enfantTerrible.enfantTerrible.dto.admin.product;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminSkuSaveInternalRequest {

  private Long skuId; // useGeneratedKeys 결과 주입용

  private Long productId;
  private String skuCode;
  private Long price;
  private Long stock;
  private String status;

  public AdminSkuSaveInternalRequest() {
  }

  public AdminSkuSaveInternalRequest(Long productId, String skuCode, Long price, Long stock, String status) {
    this.productId = productId;
    this.skuCode = skuCode;
    this.price = price;
    this.stock = stock;
    this.status = status;
  }
}
