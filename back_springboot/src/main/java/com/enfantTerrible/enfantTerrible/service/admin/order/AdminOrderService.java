package com.enfantTerrible.enfantTerrible.service.admin.order;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.OrderStatus;
import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderItemResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderListResponse;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.admin.order.AdminOrderMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminOrderService {

  private final AdminOrderMapper adminOrderMapper;

  @Transactional(readOnly = true)
  public AdminPageResponse<AdminOrderListResponse> getOrders(AdminOrderListRequest req) {
    normalizePaging(req);

    int total = adminOrderMapper.countOrders(req);
    List<AdminOrderListResponse> list = adminOrderMapper.findOrders(req);

    return new AdminPageResponse<>(
        req.getPage(),
        req.getSize(),
        total,
        list
    );
  }

  @Transactional(readOnly = true)
  public AdminOrderDetailResponse getOrderDetail(Long orderId) {

    AdminOrderDetailResponse order = adminOrderMapper.findOrderDetail(orderId);
    if (order == null) {
      throw new BusinessException("주문을 찾을 수 없습니다.");
    }

    List<AdminOrderItemResponse> items = adminOrderMapper.findOrderItems(orderId);
    order.setItems(items);
    return order;
  }

  @Transactional
  public void updateOrderStatus(Long orderId, String status) {

    OrderStatus s;
    try {
      s = OrderStatus.from(status);
    } catch (Exception e) {
      throw new BusinessException("주문 상태 값이 올바르지 않습니다.");
    }

    AdminOrderDetailResponse order = adminOrderMapper.findOrderDetail(orderId);
    if (order == null) {
      throw new BusinessException("주문을 찾을 수 없습니다.");
    }

    int updated = adminOrderMapper.updateOrderStatus(orderId, s.name());
    if (updated != 1) {
      throw new BusinessException("주문 상태 변경에 실패했습니다.");
    }
  }

  private void normalizePaging(AdminOrderListRequest req) {
    if (req == null) {
      throw new BusinessException("요청 값이 비어있습니다.");
    }

    if (req.getPage() < 1) {
      req.setPage(1);
    }

    if (req.getSize() < 1) {
      req.setSize(20);
    } else if (req.getSize() > 200) {
      req.setSize(200);
    }
  }
}
