package com.enfantTerrible.enfantTerrible.mapper.category;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.category.CategoryRow;

@Mapper
public interface CategoryMapper {

  /**
   * 사용자용 - 전체 활성 카테고리 조회
   * (트리 구성용)
   */
  List<CategoryRow> findAllActive();

  /**
   * 사용자용 - 특정 부모의 활성 카테고리 조회
   */
  List<CategoryRow> findActiveByParentId(@Param("parentId") Long parentId);
}