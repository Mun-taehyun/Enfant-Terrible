package com.enfantTerrible.enfantTerrible.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryUpdateRequest {

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
