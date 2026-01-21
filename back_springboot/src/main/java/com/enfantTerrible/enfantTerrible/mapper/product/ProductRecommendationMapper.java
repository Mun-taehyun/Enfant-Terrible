package com.enfantTerrible.enfantTerrible.mapper.product;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ProductRecommendationMapper {

  List<Long> findRecommendedProductIdsByUserId(
      @Param("userId") Long userId,
      @Param("limit") int limit
  );

  List<Long> findBestSellingProductIds(
      @Param("limit") int limit
  );
}
