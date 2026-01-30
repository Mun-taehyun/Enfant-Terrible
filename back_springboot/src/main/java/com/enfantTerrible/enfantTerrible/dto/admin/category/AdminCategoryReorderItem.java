package com.enfantTerrible.enfantTerrible.dto.admin.category;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminCategoryReorderItem {

  @NotNull
  private Long categoryId;

  private Long parentId;

  @NotNull
  private Integer sortOrder;
}
