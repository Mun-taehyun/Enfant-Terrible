package com.enfantTerrible.enfantTerrible.controller.admin.order;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderListResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderItemCancelRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderItemCancelResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderShippingRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderStatusUpdateRequest;
import com.enfantTerrible.enfantTerrible.service.admin.order.AdminOrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

  private final AdminOrderService adminOrderService;

  @GetMapping
  public ApiResponse<AdminPageResponse<AdminOrderListResponse>> list(
      AdminOrderListRequest req
  ) {
    return ApiResponse.success(
        adminOrderService.getOrders(req),
        "관리자 주문 목록 조회 성공"
    );
  }

  @GetMapping("/{orderId}")
  public ApiResponse<AdminOrderDetailResponse> detail(
      @PathVariable Long orderId
  ) {
    return ApiResponse.success(
        adminOrderService.getOrderDetail(orderId),
        "관리자 주문 상세 조회 성공"
    );
  }

  @PatchMapping("/{orderId}/status")
  public ApiResponse<Void> updateStatus(
      @PathVariable Long orderId,
      @Valid @RequestBody AdminOrderStatusUpdateRequest req
  ) {
    adminOrderService.updateOrderStatus(orderId, req.getStatus());
    return ApiResponse.successMessage("주문 상태 변경 완료");
  }

  @PatchMapping("/{orderId}/shipping")
  public ApiResponse<Void> startShipping(
      @PathVariable Long orderId,
      @Valid @RequestBody AdminOrderShippingRequest req
  ) {
    adminOrderService.startShipping(orderId, req.getTrackingNumber());
    return ApiResponse.successMessage("배송 시작 처리 완료");
  }

  @PostMapping("/{orderId}/items/cancel")
  public ApiResponse<AdminOrderItemCancelResponse> cancelItems(
      @PathVariable Long orderId,
      @Valid @RequestBody AdminOrderItemCancelRequest req
  ) {
    return ApiResponse.success(
        adminOrderService.cancelItems(orderId, req),
        "부분취소 처리 완료"
    );
  }
}
