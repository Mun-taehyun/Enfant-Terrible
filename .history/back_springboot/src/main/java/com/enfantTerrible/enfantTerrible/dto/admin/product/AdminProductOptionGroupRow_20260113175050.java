package com.enfantTerrible.enfantTerrible.dto.admin.product;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductOptionGroupRow {

  private Long optionGroupId;
  private Long productId;

  private String name;
  private Integer sortOrder;

  private LocalDateTime createdAt;
}
