package com.enfantTerrible.enfantTerrible.dto.admin.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductOptionValueSaveRequest {

  @NotNull
  private Long optionGroupId;

  @NotBlank
  private String value;

  private Integer sortOrder;
}
