package com.enfantTerrible.enfantTerrible.controller.cart;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.cart.CartItemAddRequest;
import com.enfantTerrible.enfantTerrible.dto.cart.CartItemResponse;
import com.enfantTerrible.enfantTerrible.dto.cart.CartItemUpdateRequest;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.service.cart.CartService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {

  private final CartService cartService;

  @PostMapping("/items")
  public ApiResponse<Void> addItem(
      @RequestBody CartItemAddRequest req,
      @AuthenticationPrincipal CustomUserPrincipal principal
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }
    cartService.addItem(principal.getUserId(), req);
    return ApiResponse.successMessage("장바구니에 담았습니다.");
  }

  @GetMapping("/items")
  public ApiResponse<List<CartItemResponse>> getItems(
      @AuthenticationPrincipal CustomUserPrincipal principal
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }
    return ApiResponse.success(
        cartService.getItems(principal.getUserId()),
        "장바구니 조회 성공"
    );
  }

  @PutMapping("/items/{cartItemId}")
  public ApiResponse<Void> updateItem(
      @PathVariable Long cartItemId,
      @RequestBody CartItemUpdateRequest req,
      @AuthenticationPrincipal CustomUserPrincipal principal
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }
    cartService.updateItem(principal.getUserId(), cartItemId, req);
    return ApiResponse.successMessage("수량 변경 성공");
  }

  @DeleteMapping("/items/{cartItemId}")
  public ApiResponse<Void> deleteItem(
      @PathVariable Long cartItemId,
      @AuthenticationPrincipal CustomUserPrincipal principal
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }
    cartService.deleteItem(principal.getUserId(), cartItemId);
    return ApiResponse.successMessage("장바구니에서 삭제되었습니다.");
  }

  @DeleteMapping("/items")
  public ApiResponse<Void> clear(
      @AuthenticationPrincipal CustomUserPrincipal principal
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }
    cartService.clear(principal.getUserId());
    return ApiResponse.successMessage("장바구니를 비웠습니다.");
  }
}
