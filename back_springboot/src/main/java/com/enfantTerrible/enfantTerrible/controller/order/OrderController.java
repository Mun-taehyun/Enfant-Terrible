package com.enfantTerrible.enfantTerrible.controller.order;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.order.OrderCreateResponse;
import com.enfantTerrible.enfantTerrible.dto.order.OrderFromCartRequest;
import com.enfantTerrible.enfantTerrible.dto.order.MyOrderCancelRequest;
import com.enfantTerrible.enfantTerrible.dto.order.MyOrderCancelResponse;
import com.enfantTerrible.enfantTerrible.dto.order.MyOrderDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.order.MyOrderListItemResponse;
import com.enfantTerrible.enfantTerrible.dto.order.OrderPrepareResponse;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.common.response.PageResponse;
import com.enfantTerrible.enfantTerrible.service.cart.CartOrderAssembler;
import com.enfantTerrible.enfantTerrible.service.cart.CartService;
import com.enfantTerrible.enfantTerrible.service.order.OrderService;
import com.enfantTerrible.enfantTerrible.service.order.OrderPrepareService;
import com.enfantTerrible.enfantTerrible.service.order.MyOrderService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

  private final OrderService orderService;
  private final OrderPrepareService orderPrepareService;
  private final MyOrderService myOrderService;
  private final CartService cartService;
  private final CartOrderAssembler cartOrderAssembler;

  @GetMapping("/my")
  public ApiResponse<PageResponse<MyOrderListItemResponse>> myOrders(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }
    return ApiResponse.success(
        myOrderService.getMyOrders(principal.getUserId(), page, size),
        "내 주문 목록 조회 성공"
    );
  }

  @GetMapping("/my/{orderId}")
  public ApiResponse<MyOrderDetailResponse> myOrderDetail(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @PathVariable Long orderId
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }
    return ApiResponse.success(
        myOrderService.getMyOrderDetail(principal.getUserId(), orderId),
        "내 주문 상세 조회 성공"
    );
  }

  @PostMapping("/my/{orderId}/cancel")
  public ApiResponse<MyOrderCancelResponse> cancelMyOrder(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @PathVariable Long orderId,
      @RequestBody(required = false) MyOrderCancelRequest req
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }
    return ApiResponse.success(
        myOrderService.cancelMyOrder(principal.getUserId(), orderId, req),
        "주문 취소 성공"
    );
  }

  @GetMapping("/prepare/from-cart")
  public ApiResponse<OrderPrepareResponse> prepareFromCart(
      @AuthenticationPrincipal CustomUserPrincipal principal
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }
    return ApiResponse.success(
        orderPrepareService.prepareFromCart(principal.getUserId()),
        "장바구니 주문 사전조회 성공"
    );
  }

  @GetMapping("/prepare/direct")
  public ApiResponse<OrderPrepareResponse> prepareDirect(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @RequestParam Long productId,
      @RequestParam(required = false) java.util.List<Long> optionValueIds,
      @RequestParam Integer quantity
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }
    return ApiResponse.success(
        orderPrepareService.prepareDirect(
            principal.getUserId(),
            productId,
            optionValueIds,
            quantity
        ),
        "바로구매 주문 사전조회 성공"
    );
  }

  @PostMapping("/from-cart")
  public ApiResponse<OrderCreateResponse> fromCart(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @RequestBody OrderFromCartRequest req
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    var cartItems = cartService.getItems(principal.getUserId());

    var cmd = cartOrderAssembler.fromCart(
        principal.getUserId(),
        req.getOrderCode(),
        cartItems,
        req.getReceiverName(),
        req.getReceiverPhone(),
        req.getZipCode(),
        req.getAddressBase(),
        req.getAddressDetail(),
        req.getUsedPoint()
    );

    return ApiResponse.success(
        orderService.create(cmd),
        "장바구니 주문 성공"
    );
  }
}
