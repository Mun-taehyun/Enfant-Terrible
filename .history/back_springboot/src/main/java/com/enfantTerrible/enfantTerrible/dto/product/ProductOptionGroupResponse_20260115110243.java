// ProductOptionGroupResponse.java
package com.enfantTerrible.enfantTerrible.dto.product;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductOptionGroupResponse {
  private Long optionGroupId;
  private String name;
  private List<ProductOptionValueResponse> values;
}
