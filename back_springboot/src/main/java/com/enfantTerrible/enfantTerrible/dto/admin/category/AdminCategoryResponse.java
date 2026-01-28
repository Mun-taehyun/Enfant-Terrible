package com.enfantTerrible.enfantTerrible.dto.admin.category;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminCategoryResponse {

  private Long categoryId;
  private Long parentId;

  private String name;
  private Integer depth;
  private Integer sortOrder;

  private String isActive;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  // 관리자 트리 화면 대비
  private List<AdminCategoryResponse> children = new ArrayList<>();
}
