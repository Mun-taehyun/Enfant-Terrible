package com.enfantTerrible.enfantTerrible.mapper.product;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.product.ProductRow;

@Mapper
public interface ProductMapper {

  // 최신순
  List<ProductRow> findProductsOrderByRecent(
      @Param("categoryId") Long categoryId,
      @Param("keyword") String keyword,
      @Param("size") int size,
      @Param("offset") int offset
  );

  // 가격 낮은 순
  List<ProductRow> findProductsOrderByPriceAsc(
      @Param("categoryId") Long categoryId,
      @Param("keyword") String keyword,
      @Param("size") int size,
      @Param("offset") int offset
  );

  // 가격 높은 순
  List<ProductRow> findProductsOrderByPriceDesc(
      @Param("categoryId") Long categoryId,
      @Param("keyword") String keyword,
      @Param("size") int size,
      @Param("offset") int offset
  );

  // 이름순
  List<ProductRow> findProductsOrderByName(
      @Param("categoryId") Long categoryId,
      @Param("keyword") String keyword,
      @Param("size") int size,
      @Param("offset") int offset
  );

  // 상품 상세
  ProductRow findById(@Param("productId") Long productId);
}
