package com.enfantTerrible.enfantTerrible.dto.admin.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminCategoryUpdateRequest {

  @NotNull
  private Long categoryId;

  @NotBlank
  private String name;

  @NotNull
  private Integer sortOrder;

  // 'Y' / 'N'
  @NotBlank
  private String isActive;
}
