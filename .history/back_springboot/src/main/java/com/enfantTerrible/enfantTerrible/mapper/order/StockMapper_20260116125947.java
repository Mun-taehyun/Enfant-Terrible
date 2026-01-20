package com.enfantTerrible.enfantTerrible.mapper.order;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface StockMapper {

  int decreaseStock(
      @Param("skuId") Long skuId,
      @Param("quantity") Integer quantity
  );
}
