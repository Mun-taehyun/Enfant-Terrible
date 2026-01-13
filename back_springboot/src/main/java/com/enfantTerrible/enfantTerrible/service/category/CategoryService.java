package com.enfantTerrible.enfantTerrible.service.category;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    // parentId 기준으로 그룹핑
    Map<Long, List<CategoryResponse>> childrenMap = new HashMap<>();

    for (CategoryRow row : rows) {
      CategoryResponse res = toResponse(row);
      childrenMap
          .computeIfAbsent(row.getParentId(), k -> new ArrayList<>())
          .add(res);
    }

    // 루트 카테고리 (parentId == null)
    List<CategoryResponse> roots = childrenMap.getOrDefault(null, new ArrayList<>());

    // 재귀적으로 children 세팅
    for (CategoryResponse root : roots) {
      attachChildren(root, childrenMap);
    }

    return roots;
  }

  /**
   * 사용자용 - 특정 부모의 하위 카테고리 조회
   */
  public List<CategoryResponse> getChildren(Long parentId) {

    List<CategoryRow> rows = categoryMapper.findActiveByParentId(parentId);

    List<CategoryResponse> result = new ArrayList<>();
    for (CategoryRow row : rows) {
      result.add(toResponse(row));
    }

    return result;
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
    res.setIsActive(row.getIsActive());
    return res;
  }

  /**
   * 트리 구조 재귀 조립
   */
  private void attachChildren(
      CategoryResponse parent,
      Map<Long, List<CategoryResponse>> childrenMap
  ) {

    List<CategoryResponse> children =
        childrenMap.getOrDefault(parent.getCategoryId(), new ArrayList<>());

    parent.setChildren(children);

    for (CategoryResponse child : children) {
      attachChildren(child, childrenMap);
    }
  }
}
