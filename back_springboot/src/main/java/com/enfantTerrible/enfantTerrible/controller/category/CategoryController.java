package com.enfantTerrible.enfantTerrible.controller.category;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.category.CategoryResponse;
import com.enfantTerrible.enfantTerrible.service.category.CategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/categories")
public class CategoryController {

  private final CategoryService categoryService;

  /**
   * 사용자용 - 전체 카테고리 트리 조회
   * GET /api/categories/tree
   */
  @GetMapping("/tree")
  public ApiResponse<List<CategoryResponse>> getCategoryTree() {
    List<CategoryResponse> result = categoryService.getCategoryTree();
    return ApiResponse.success(result, "카테고리 트리 조회 성공");
  }

  /**
   * 사용자용 - 특정 부모의 하위 카테고리 조회
   * GET /api/categories/children?parentId=1
   */
  @GetMapping("/children")
  public ApiResponse<List<CategoryResponse>> getChildren(
      @RequestParam Long parentId
  ) {
    List<CategoryResponse> result = categoryService.getChildren(parentId);
    return ApiResponse.success(result, "하위 카테고리 조회 성공");
  }
}
