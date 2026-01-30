package com.enfantTerrible.enfantTerrible.dto.admin.category;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminCategoryReorderRequest {

  @NotNull
  private List<AdminCategoryReorderItem> items;
}
