package com.enfantTerrible.enfantTerrible.service.category;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.util.CategoryTreeUtils;
import com.enfantTerrible.enfantTerrible.dto.category.CategoryResponse;
import com.enfantTerrible.enfantTerrible.dto.category.CategoryRow;
import com.enfantTerrible.enfantTerrible.mapper.category.CategoryMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

  private final CategoryMapper categoryMapper;

  /**
   * 사용자용 - 전체 카테고리 트리 조회
   */
  public List<CategoryResponse> getCategoryTree() {
    List<CategoryRow> rows = categoryMapper.findAllActive();

    // 먼저 Row를 Response로 변환
    List<CategoryResponse> responses = rows.stream()
        .map(this::toResponse)
        .toList();

    // 유틸리티를 사용한 트리 구조 조립
    return CategoryTreeUtils.buildTree(
        responses,
        CategoryResponse::getCategoryId,
        CategoryResponse::getParentId,
        CategoryResponse::setChildren
    );
  }

  /**
   * 사용자용 - 특정 부모의 하위 카테고리 조회
   */
  public List<CategoryResponse> getChildren(Long parentId) {
    List<CategoryRow> rows = categoryMapper.findActiveByParentId(parentId);

    return rows.stream()
        .map(this::toResponse)
        .toList();
  }

  /**
   * Row -> Response 변환
   */
  private CategoryResponse toResponse(CategoryRow row) {
    CategoryResponse res = new CategoryResponse();
    res.setCategoryId(row.getCategoryId());
    res.setParentId(row.getParentId());
    res.setName(row.getName());
    res.setDepth(row.getDepth());
    res.setSortOrder(row.getSortOrder());
    res.setStatus(row.getStatus());
    return res;
  }
}
