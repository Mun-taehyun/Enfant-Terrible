package com.enfantTerrible.enfantTerrible.dto.admin.product;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminSkuResponse {

  private Long skuId;
  private Long productId;

  private String skuCode;
  private Long price;
  private Long stock;
  private String status;

  private List<Long> optionValueIds;

  private LocalDateTime createdAt;
}
