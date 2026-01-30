package com.enfantTerrible.enfantTerrible.dto.admin.product;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductOptionGroupReorderRequest {

  @NotNull
  private Long productId;

  @NotNull
  private List<Long> orderedGroupIds;
}
