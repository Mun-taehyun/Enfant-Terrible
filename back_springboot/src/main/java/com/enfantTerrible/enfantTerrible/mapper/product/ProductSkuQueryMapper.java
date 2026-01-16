package com.enfantTerrible.enfantTerrible.mapper.product;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.product.ProductSkuOptionRow;

@Mapper
public interface ProductSkuQueryMapper {

  List<ProductSkuOptionRow> findSkuByExactOptionMatch(
      @Param("productId") Long productId,
      @Param("optionValueIds") List<Long> optionValueIds,
      @Param("optionCount") int optionCount
  );
}
