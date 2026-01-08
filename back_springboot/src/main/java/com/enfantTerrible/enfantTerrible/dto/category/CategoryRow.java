package com.enfantTerrible.enfantTerrible.dto.category;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRow {

  private Long categoryId;
  private Long parentId;

  private String name;

  private Integer depth;
  private Integer sortOrder;

  // 'Y' / 'N'
  private String isActive;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private LocalDateTime deletedAt;
}
