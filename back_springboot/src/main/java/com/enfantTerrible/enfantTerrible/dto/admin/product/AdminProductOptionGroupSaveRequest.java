package com.enfantTerrible.enfantTerrible.dto.admin.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductOptionGroupSaveRequest {

  @NotNull
  private Long productId;

  @NotBlank
  private String name;

  private Integer sortOrder;
}
