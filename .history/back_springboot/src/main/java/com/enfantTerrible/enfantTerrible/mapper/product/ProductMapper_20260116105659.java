package com.enfantTerrible.enfantTerrible.mapper.product;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.product.ProductRow;
import com.enfantTerrible.enfantTerrible.dto.product.ProductSkuOptionRow;

@Mapper
public interface ProductMapper {

  List<ProductRow> findProducts(
      @Param("categoryId") Long categoryId,
      @Param("keyword") String keyword,
      @Param("orderBy") String orderBy,
      @Param("size") int size,
      @Param("offset") int offset
  );

  // 사용자 상세 조회 전용 (노출 조건 포함)
  ProductRow findByIdForUser(@Param("productId") Long productId);

  List<ProductSkuOptionRow> findSkusWithOptions(@Param("productId") Long productId);
}
