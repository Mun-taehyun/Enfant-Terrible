package com.enfantTerrible.enfantTerrible.dto.product;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductOptionGroupRow {

  private Long optionGroupId;
  private Long productId;

  private String name;
  private Integer sortOrder;
}
