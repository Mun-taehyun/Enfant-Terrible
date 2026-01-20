package com.enfantTerrible.enfantTerrible.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryCreateRequest {

  // 최상위 카테고리는 null
  private Long parentId;

  @NotBlank
  private String name;

  @NotNull
  private Integer sortOrder;
}
