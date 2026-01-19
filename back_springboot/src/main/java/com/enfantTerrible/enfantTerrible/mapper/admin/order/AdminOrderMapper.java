package com.enfantTerrible.enfantTerrible.mapper.admin.order;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderItemResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderListResponse;

@Mapper
public interface AdminOrderMapper {

  List<AdminOrderListResponse> findOrders(
      @Param("req") AdminOrderListRequest req
  );

  int countOrders(
      @Param("req") AdminOrderListRequest req
  );

  AdminOrderDetailResponse findOrderDetail(
      @Param("orderId") Long orderId
  );

  List<AdminOrderItemResponse> findOrderItems(
      @Param("orderId") Long orderId
  );

  int updateOrderStatus(
      @Param("orderId") Long orderId,
      @Param("status") String status
  );
}
