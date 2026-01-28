package com.enfantTerrible.enfantTerrible.dto.product;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductOptionValueRow {

  private Long optionValueId;
  private Long optionGroupId;

  private String value;
  private Integer sortOrder;
}
