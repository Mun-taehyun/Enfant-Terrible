package com.enfantTerrible.enfantTerrible.dto.product;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductListRequest {

  private Integer page;
  private Integer size;

  // 선택 필터
  private Long categoryId;
}
