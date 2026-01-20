package com.enfantTerrible.enfantTerrible.controller.order;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.order.OrderCreateResponse;
import com.enfantTerrible.enfantTerrible.dto.order.OrderFromCartRequest;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.service.cart.CartOrderAssembler;
import com.enfantTerrible.enfantTerrible.service.cart.CartService;
import com.enfantTerrible.enfantTerrible.service.order.OrderService;

import jakarta.validation.Valid;
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
      @Valid @RequestBody OrderFromCartRequest req
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    var cartItems = cartService.getItems(principal.getUserId());

    var cmd = cartOrderAssembler.fromCart(
        principal.getUserId(),
        cartItems,
        req.getReceiverName(),
        req.getReceiverPhone(),
        req.getZipCode(),
        req.getAddressBase(),
        req.getAddressDetail()
    );

    return ApiResponse.success(
        orderService.create(cmd),
        "장바구니 주문 성공"
    );
  }
}
