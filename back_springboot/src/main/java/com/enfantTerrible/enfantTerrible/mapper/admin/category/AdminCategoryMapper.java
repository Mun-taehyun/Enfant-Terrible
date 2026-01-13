package com.enfantTerrible.enfantTerrible.mapper.admin.category;

import java.util.List;
import java.util.Optional;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.admin.category.AdminCategoryRow;

@Mapper
public interface AdminCategoryMapper {

  /* =======================
   * 조회
   * ======================= */

  Optional<AdminCategoryRow> findById(@Param("categoryId") Long categoryId);

  List<AdminCategoryRow> findAll();

  /* =======================
   * 생성
   * ======================= */

  int insert(AdminCategoryRow row);

  /* =======================
   * 기본 수정
   * ======================= */

  int update(AdminCategoryRow row);

  /* =======================
   * 활성 / 비활성
   * ======================= */

  int updateActiveStatus(
      @Param("categoryId") Long categoryId,
      @Param("isActive") String isActive
  );

  /* =======================
   * 정렬 순서 변경
   * ======================= */

  int updateSortOrder(
      @Param("categoryId") Long categoryId,
      @Param("sortOrder") Integer sortOrder
  );

  /* =======================
   * 부모 변경 (카테고리 이동)
   * ======================= */

  int updateParent(
      @Param("categoryId") Long categoryId,
      @Param("parentId") Long parentId,
      @Param("depth") Integer depth
  );

  /* =======================
   * 삭제
   * ======================= */

  int softDelete(@Param("categoryId") Long categoryId);

  /* =======================
   * 중복 체크
   * ======================= */

  boolean existsByParentAndName(
      @Param("parentId") Long parentId,
      @Param("name") String name
  );

  List<AdminCategoryRow> findSubtree(@Param("rootId") Long rootId);

  int updateDepth(
      @Param("categoryId") Long categoryId,
      @Param("depth") Integer depth
  );
  
}
