package com.enfantTerrible.enfantTerrible.mapper.product;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ProductSkuOptionValueQueryMapper {

  List<Long> findOptionValueIdsBySkuId(@Param("skuId") Long skuId);
}
