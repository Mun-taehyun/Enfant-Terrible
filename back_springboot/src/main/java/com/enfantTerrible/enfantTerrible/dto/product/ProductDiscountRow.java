package com.enfantTerrible.enfantTerrible.dto.product;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductDiscountRow {

  private Long discountId;
  private Long productId;
  private Integer discountValue;
  private String discountType;
  private LocalDateTime startAt;
  private LocalDateTime endAt;
  private LocalDateTime createdAt;
}
