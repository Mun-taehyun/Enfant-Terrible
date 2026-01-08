package com.enfantTerrible.enfantTerrible.dto.category;

import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryResponse {

  private Long categoryId;
  private Long parentId;

  private String name;

  private Integer depth;
  private Integer sortOrder;

  private String isActive;

  private List<CategoryResponse> children = new ArrayList<>();
}
