package com.enfantTerrible.enfantTerrible.mapper.order;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.order.OrderRow;

@Mapper
public interface OrderMapper {

  int insertOrder(
      @Param("userId") Long userId,
      @Param("orderCode") String orderCode,
      @Param("orderStatus") String orderStatus,
      @Param("totalAmount") Long totalAmount,
      @Param("receiverName") String receiverName,
      @Param("receiverPhone") String receiverPhone,
      @Param("zipCode") String zipCode,
      @Param("addressBase") String addressBase,
      @Param("addressDetail") String addressDetail
  );

  Long findLastInsertId();

  OrderRow findByIdForPayment(@Param("orderId") Long orderId);

  OrderRow findByCodeForPayment(@Param("orderCode") String orderCode);

  int updateOrderStatus(
      @Param("orderId") Long orderId,
      @Param("orderStatus") String orderStatus
  );
}
