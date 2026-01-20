package com.enfantTerrible.enfantTerrible.dto.admin.product;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductOptionValueRow {

  private Long optionValueId;
  private Long optionGroupId;

  private String value;
  private Integer sortOrder;
}
