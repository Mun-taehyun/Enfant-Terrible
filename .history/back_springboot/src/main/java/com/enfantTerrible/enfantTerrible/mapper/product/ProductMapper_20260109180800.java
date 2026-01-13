package com.enfantTerrible.enfantTerrible.mapper.product;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.product.ProductRow;

@Mapper
public interface ProductMapper {

  /**
   * 사용자 상품 목록 조회 (정렬 통합)
   */
  List<ProductRow> findProducts(
      @Param("categoryId") Long categoryId,
      @Param("keyword") String keyword,
      @Param("orderBy") String orderBy,
      @Param("size") int size,
      @Param("offset") int offset
  );

  /**
   * 사용자 상품 상세 조회
   */
  ProductRow findById(@Param("productId") Long productId);
}
