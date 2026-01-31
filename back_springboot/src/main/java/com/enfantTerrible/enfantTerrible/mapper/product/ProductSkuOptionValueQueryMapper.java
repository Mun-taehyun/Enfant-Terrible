package com.enfantTerrible.enfantTerrible.mapper.product;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.product.ProductSkuOptionRow;

@Mapper
public interface ProductSkuOptionValueQueryMapper {

  List<Long> findOptionValueIdsBySkuId(@Param("skuId") Long skuId);

  List<ProductSkuOptionRow> findSkuOptionsBySkuIds(@Param("skuIds") List<Long> skuIds);
}
