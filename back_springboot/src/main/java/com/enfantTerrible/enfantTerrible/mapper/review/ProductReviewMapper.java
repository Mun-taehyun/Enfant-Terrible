package com.enfantTerrible.enfantTerrible.mapper.review;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.review.ProductReviewRow;

@Mapper
public interface ProductReviewMapper {

  int insert(
      @Param("userId") Long userId,
      @Param("productId") Long productId,
      @Param("orderId") Long orderId,
      @Param("rating") Integer rating,
      @Param("content") String content
  );

  Long findLastInsertId();

  ProductReviewRow findById(@Param("reviewId") Long reviewId);

  List<ProductReviewRow> findByProductId(
      @Param("productId") Long productId,
      @Param("size") int size,
      @Param("offset") int offset
  );

  int update(
      @Param("reviewId") Long reviewId,
      @Param("rating") Integer rating,
      @Param("content") String content
  );

  int softDelete(@Param("reviewId") Long reviewId);

  int existsPurchase(
      @Param("userId") Long userId,
      @Param("orderId") Long orderId,
      @Param("productId") Long productId
  );

  int existsByOrderAndProduct(
      @Param("orderId") Long orderId,
      @Param("productId") Long productId
  );
}
