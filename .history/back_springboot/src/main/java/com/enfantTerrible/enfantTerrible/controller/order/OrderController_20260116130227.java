package com.enfantTerrible.enfantTerrible.controller.order;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.order.OrderCreateResponse;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.service.cart.CartOrderAssembler;
import com.enfantTerrible.enfantTerrible.service.cart.CartService;
import com.enfantTerrible.enfantTerrible.service.order.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

  private final OrderService orderService;
  private final CartService cartService;
  private final CartOrderAssembler cartOrderAssembler;

  @PostMapping("/from-cart")
  public ApiResponse<OrderCreateResponse> fromCart(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @RequestParam String receiverName,
      @RequestParam String receiverPhone,
      @RequestParam String zipCode,
      @RequestParam String addressBase,
      @RequestParam(required = false) String addressDetail
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    var cartItems = cartService.getItems(principal.getUserId());

    var cmd = cartOrderAssembler.fromCart(
        principal.getUserId(),
        cartItems,
        receiverName,
        receiverPhone,
        zipCode,
        addressBase,
        addressDetail
    );

    return ApiResponse.success(
        orderService.create(cmd),
        "장바구니 주문 성공"
    );
  }
}
