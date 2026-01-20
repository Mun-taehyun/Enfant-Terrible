package com.enfantTerrible.enfantTerrible.controller.order;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.order.*;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.service.order.OrderService;
import com.enfantTerrible.enfantTerrible.mapper.product.ProductSkuQueryMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class DirectOrderController {

  private final OrderService orderService;
  private final ProductSkuQueryMapper skuQueryMapper;

  @PostMapping("/direct")
  public ApiResponse<OrderCreateResponse> direct(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @RequestBody DirectOrderRequest req
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    var sku = skuQueryMapper.findSkuById(req.getSkuId());
    if (sku == null) {
      throw new BusinessException("SKU가 존재하지 않습니다.");
    }

    OrderItemCommand item = new OrderItemCommand();
    item.setSkuId(sku.getSkuId());
    item.setPrice(sku.getPrice());
    item.setQuantity(req.getQuantity());
    item.setProductName(sku.getProductName());

    OrderCreateCommand cmd = new OrderCreateCommand();
    cmd.setUserId(principal.getUserId());
    cmd.setItems(java.util.List.of(item));
    cmd.setReceiverName(req.getReceiverName());
    cmd.setReceiverPhone(req.getReceiverPhone());
    cmd.setZipCode(req.getZipCode());
    cmd.setAddressBase(req.getAddressBase());
    cmd.setAddressDetail(req.getAddressDetail());

    return ApiResponse.success(
        orderService.create(cmd),
        "바로 구매 주문 성공"
    );
  }
}
