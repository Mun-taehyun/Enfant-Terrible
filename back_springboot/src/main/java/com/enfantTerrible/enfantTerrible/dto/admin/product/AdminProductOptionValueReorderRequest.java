package com.enfantTerrible.enfantTerrible.dto.admin.product;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductOptionValueReorderRequest {

  @NotNull
  private Long optionGroupId;

  @NotNull
  private List<Long> orderedValueIds;
}
