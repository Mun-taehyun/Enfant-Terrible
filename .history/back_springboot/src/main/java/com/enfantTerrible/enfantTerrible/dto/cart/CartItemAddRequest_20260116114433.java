package com.enfantTerrible.enfantTerrible.dto.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemAddRequest {

  @NotNull
  private Long skuId;

  @NotNull
  @Min(1)
  private Integer quantity;
}
