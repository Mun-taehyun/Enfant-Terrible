package com.enfantTerrible.enfantTerrible.dto.admin.product;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminSkuListRequest {

  private Integer page;
  private Integer size;

  private Long productId;
  private String status;
}
