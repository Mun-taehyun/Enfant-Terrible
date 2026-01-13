package com.enfantTerrible.enfantTerrible.dto.admin.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminCategoryCreateRequest {

  // 최상위면 null
  private Long parentId;

  @NotBlank
  private String name;

  @NotNull
  private Integer sortOrder;
}
