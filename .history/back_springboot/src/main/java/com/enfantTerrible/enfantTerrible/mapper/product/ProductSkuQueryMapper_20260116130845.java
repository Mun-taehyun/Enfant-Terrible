package com.enfantTerrible.enfantTerrible.mapper.product;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.product.ProductSkuRow;

@Mapper
public interface ProductSkuQueryMapper {

  /**
   * 옵션 조합과 정확히 일치하는 SKU 단건 조회
   */
  ProductSkuRow findSkuByExactOptionMatch(
      @Param("productId") Long productId,
      @Param("optionValueIds") List<Long> optionValueIds,
      @Param("optionCount") int optionCount
  );

  /**
   * (선택) skuId 직접 조회
   */
  ProductSkuRow findById(@Param("skuId") Long skuId);
}
