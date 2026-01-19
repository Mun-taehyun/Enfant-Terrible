package com.enfantTerrible.enfantTerrible.mapper.order;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.order.OrderItemRow;

@Mapper
public interface OrderItemMapper {

  int insertOrderItem(
      @Param("orderId") Long orderId,
      @Param("skuId") Long skuId,
      @Param("productName") String productName,
      @Param("price") Long price,
      @Param("quantity") Integer quantity
  );

  List<OrderItemRow> findByOrderId(@Param("orderId") Long orderId);

  int increaseCancelledQuantity(
      @Param("orderId") Long orderId,
      @Param("skuId") Long skuId,
      @Param("cancelQty") Integer cancelQty
  );

  Long sumRemainingAmount(@Param("orderId") Long orderId);

  Long sumCancelledAmount(@Param("orderId") Long orderId);
}
