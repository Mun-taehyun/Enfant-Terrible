// ProductSkuResponse.java
package com.enfantTerrible.enfantTerrible.dto.product;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductSkuResponse {

  private Long skuId;
  private Long price;
  private Long discountedPrice;
  private Long stock;
  private String status;

  private List<Long> optionValueIds;
}
