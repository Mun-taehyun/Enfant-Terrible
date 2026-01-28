package com.enfantTerrible.enfantTerrible.dto.admin.product;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductOptionGroupResponse {

  private Long optionGroupId;
  private Long productId;

  private String name;
  private Integer sortOrder;
}
