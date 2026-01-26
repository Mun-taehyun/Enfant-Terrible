package com.enfantTerrible.enfantTerrible.mapper.order;

import java.time.LocalDateTime;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.order.OrderRow;
import com.enfantTerrible.enfantTerrible.dto.order.MyOrderDetailRow;
import com.enfantTerrible.enfantTerrible.dto.order.MyOrderListItemResponse;

@Mapper
public interface OrderMapper {

  int insertOrder(
      @Param("userId") Long userId,
      @Param("orderCode") String orderCode,
      @Param("orderStatus") String orderStatus,
      @Param("originalAmount") Long originalAmount,
      @Param("usedPoint") Integer usedPoint,
      @Param("usedPointRefunded") Integer usedPointRefunded,
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

  int updateStatusAndTotalAmount(
      @Param("orderId") Long orderId,
      @Param("orderStatus") String orderStatus,
      @Param("totalAmount") Long totalAmount
  );

  int updateStatusTotalAndUsedPointRefunded(
      @Param("orderId") Long orderId,
      @Param("orderStatus") String orderStatus,
      @Param("totalAmount") Long totalAmount,
      @Param("usedPointRefunded") Integer usedPointRefunded
  );

  int startShipping(
      @Param("orderId") Long orderId,
      @Param("trackingNumber") String trackingNumber,
      @Param("shippedAt") LocalDateTime shippedAt,
      @Param("orderStatus") String orderStatus
  );

  int markDeliveredIfShippedBefore(
      @Param("cutoff") LocalDateTime cutoff,
      @Param("orderStatus") String orderStatus,
      @Param("deliveredAt") LocalDateTime deliveredAt
  );

  int countMyOrders(
      @Param("userId") Long userId
  );

  List<MyOrderListItemResponse> findMyOrders(
      @Param("userId") Long userId,
      @Param("size") int size,
      @Param("offset") int offset
  );

  MyOrderDetailRow findMyOrderDetail(
      @Param("userId") Long userId,
      @Param("orderId") Long orderId
  );
}
