package com.enfantTerrible.enfantTerrible.dto.admin.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminSkuSaveRequest {

  @NotNull
  private Long productId;

  @NotBlank
  private String skuCode;

  @NotNull
  private Long price;

  @NotNull
  private Long stock;

  @NotBlank
  private String status;
}
