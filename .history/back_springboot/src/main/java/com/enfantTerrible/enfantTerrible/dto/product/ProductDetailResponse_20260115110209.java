package com.enfantTerrible.enfantTerrible.dto.product;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductDetailResponse {

  private Long productId;
  private Long categoryId;
  private String categoryName;

  private String name;
  private String description;

  private String thumbnailUrl;
  private List<String> contentImageUrls;

  private List<ProductOptionGroupResponse> optionGroups;
  private List<ProductSkuResponse> skus;
}
