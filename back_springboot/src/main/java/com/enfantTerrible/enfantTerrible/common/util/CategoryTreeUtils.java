package com.enfantTerrible.enfantTerrible.common.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

/**
 * 카테고리 트리 구조 조립을 위한 공용 유틸리티
 */
public class CategoryTreeUtils {

  /**
   * 리스트를 트리 구조로 변환
   * 
   * @param items 평탄화된 카테고리 리스트
   * @param idExtractor ID 추출 함수
   * @param parentIdExtractor 부모 ID 추출 함수
   * @param childrenSetter 자식 설정 함수
   * @return 트리 구조의 루트 노드 리스트
   */
  public static <T> List<T> buildTree(
      List<T> items,
      Function<T, Long> idExtractor,
      Function<T, Long> parentIdExtractor,
      ChildrenSetter<T> childrenSetter
  ) {
    if (items == null || items.isEmpty()) {
      return new ArrayList<>();
    }

    // parentId 기준으로 그룹핑
    Map<Long, List<T>> childrenMap = new HashMap<>();
    
    for (T item : items) {
      Long parentId = parentIdExtractor.apply(item);
      childrenMap
          .computeIfAbsent(parentId, k -> new ArrayList<>())
          .add(item);
    }

    // 루트 노드 찾기 (parentId == null)
    List<T> roots = childrenMap.getOrDefault(null, new ArrayList<>());

    // 재귀적으로 children 설정
    for (T root : roots) {
      attachChildren(root, childrenMap, idExtractor, childrenSetter);
    }

    return roots;
  }

  /**
   * 재귀적으로 자식 노드들을 설정
   */
  private static <T> void attachChildren(
      T parent,
      Map<Long, List<T>> childrenMap,
      Function<T, Long> idExtractor,
      ChildrenSetter<T> childrenSetter
  ) {
    Long parentId = idExtractor.apply(parent);
    List<T> children = childrenMap.getOrDefault(parentId, new ArrayList<>());
    
    childrenSetter.setChildren(parent, children);

    for (T child : children) {
      attachChildren(child, childrenMap, idExtractor, childrenSetter);
    }
  }

  /**
   * 자식 설정을 위한 함수형 인터페이스
   */
  @FunctionalInterface
  public interface ChildrenSetter<T> {
    void setChildren(T parent, List<T> children);
  }
}
