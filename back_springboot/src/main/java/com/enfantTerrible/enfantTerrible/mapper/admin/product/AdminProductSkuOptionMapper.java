package com.enfantTerrible.enfantTerrible.mapper.admin.product;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminSkuOptionRow;

@Mapper
public interface AdminProductSkuOptionMapper {

  int insert(
      @Param("skuId") Long skuId,
      @Param("optionValueId") Long optionValueId
  );

  int deleteBySkuId(@Param("skuId") Long skuId);

  List<Long> findOptionValueIdsBySkuId(@Param("skuId") Long skuId);

  List<AdminSkuOptionRow> findSkuOptionsBySkuIds(@Param("skuIds") List<Long> skuIds);
}
