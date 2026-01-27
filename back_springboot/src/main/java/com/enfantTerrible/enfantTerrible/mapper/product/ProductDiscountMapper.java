package com.enfantTerrible.enfantTerrible.mapper.product;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.product.ProductDiscountRow;

@Mapper
public interface ProductDiscountMapper {

  ProductDiscountRow findActiveByProductId(@Param("productId") Long productId);

  List<ProductDiscountRow> findActiveByProductIds(@Param("productIds") List<Long> productIds);

  List<ProductDiscountRow> findByProductId(@Param("productId") Long productId);

  ProductDiscountRow findById(@Param("discountId") Long discountId);

  int insert(
      @Param("productId") Long productId,
      @Param("discountValue") Integer discountValue,
      @Param("discountType") String discountType,
      @Param("startAt") java.time.LocalDateTime startAt,
      @Param("endAt") java.time.LocalDateTime endAt
  );

  Long findLastInsertId();

  int update(
      @Param("discountId") Long discountId,
      @Param("discountValue") Integer discountValue,
      @Param("discountType") String discountType,
      @Param("startAt") java.time.LocalDateTime startAt,
      @Param("endAt") java.time.LocalDateTime endAt
  );

  int delete(@Param("discountId") Long discountId);
}
