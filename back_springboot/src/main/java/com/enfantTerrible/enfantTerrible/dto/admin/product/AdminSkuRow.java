package com.enfantTerrible.enfantTerrible.dto.admin.product;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminSkuRow {

  private Long skuId;
  private Long productId;

  private String skuCode;
  private Long price;
  private Long stock;
  private String status;

  private LocalDateTime createdAt;
}
