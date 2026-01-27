package com.enfantTerrible.enfantTerrible.controller.admin.category;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.category.AdminCategoryCreateRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.category.AdminCategoryResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.category.AdminCategoryUpdateRequest;
import com.enfantTerrible.enfantTerrible.service.admin.category.AdminCategoryService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

  private final AdminCategoryService adminCategoryService;

  /**
   * 관리자 - 카테고리 트리 조회
   */
  @GetMapping
  public ApiResponse<List<AdminCategoryResponse>> getCategoryTree() {
    List<AdminCategoryResponse> result = adminCategoryService.getCategoryTree();
    return ApiResponse.success(result, "카테고리 목록 조회 성공");
  }

  /**
   * 관리자 - 카테고리 생성
   */
  @PostMapping
  public ApiResponse<Void> createCategory(
      @RequestBody AdminCategoryCreateRequest req
  ) {
    adminCategoryService.createCategory(req);
    return ApiResponse.successMessage("카테고리 생성 성공");
  }

  /**
   * 관리자 - 카테고리 기본 수정
   * (이름 / 정렬 / 활성)
   */
  @PatchMapping("/{categoryId}")
  public ApiResponse<Void> updateCategory(
      @PathVariable Long categoryId,
      @RequestBody AdminCategoryUpdateRequest req
  ) {
    // path 변수 우선
    req.setCategoryId(categoryId);
    adminCategoryService.updateCategory(req);
    return ApiResponse.successMessage("카테고리 수정 성공");
  }

  /**
   * 관리자 - 활성 / 비활성 변경
   */
  @PatchMapping("/{categoryId}/active")
  public ApiResponse<Void> updateActiveStatus(
      @PathVariable Long categoryId,
      @RequestParam String isActive
  ) {
    adminCategoryService.updateActiveStatus(categoryId, isActive);
    return ApiResponse.successMessage("카테고리 상태 변경 성공");
  }

  /**
   * 관리자 - 정렬 순서 변경
   */
  @PatchMapping("/{categoryId}/sort-order")
  public ApiResponse<Void> updateSortOrder(
      @PathVariable Long categoryId,
      @RequestParam Integer sortOrder
  ) {
    adminCategoryService.updateSortOrder(categoryId, sortOrder);
    return ApiResponse.successMessage("카테고리 정렬 순서 변경 성공");
  }

  /**
   * 관리자 - 카테고리 이동 (부모 변경)
   */
  @PatchMapping("/{categoryId}/move")
  public ApiResponse<Void> moveCategory(
      @PathVariable Long categoryId,
      @RequestParam(required = false) Long parentId
  ) {
    adminCategoryService.moveCategory(categoryId, parentId);
    return ApiResponse.successMessage("카테고리 이동 성공");
  }

  /**
   * 관리자 - 카테고리 삭제 (소프트 삭제)
   */
  @DeleteMapping("/{categoryId}")
  public ApiResponse<Void> deleteCategory(
      @PathVariable Long categoryId
  ) {
    adminCategoryService.deleteCategory(categoryId);
    return ApiResponse.successMessage("카테고리 삭제 성공");
  }
}
