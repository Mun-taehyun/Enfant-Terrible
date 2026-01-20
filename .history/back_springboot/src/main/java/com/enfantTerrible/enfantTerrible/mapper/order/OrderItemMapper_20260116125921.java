package com.enfantTerrible.enfantTerrible.mapper.order;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface OrderItemMapper {

  int insertOrderItem(
      @Param("orderId") Long orderId,
      @Param("skuId") Long skuId,
      @Param("productName") String productName,
      @Param("price") Long price,
      @Param("quantity") Integer quantity
  );
}
