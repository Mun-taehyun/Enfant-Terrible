package com.enfantTerrible.enfantTerrible.controller.order;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.order.*;
import com.enfantTerrible.enfantTerrible.dto.product.ProductSkuRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.service.order.OrderService;
import com.enfantTerrible.enfantTerrible.mapper.product.ProductSkuQueryMapper;
import com.enfantTerrible.enfantTerrible.mapper.product.ProductMapper;
import com.enfantTerrible.enfantTerrible.dto.product.ProductRow;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class DirectOrderController {

  private final OrderService orderService;
  private final ProductSkuQueryMapper skuQueryMapper;
  private final ProductMapper productMapper;

  @PostMapping("/direct")
  public ApiResponse<OrderCreateResponse> direct(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @RequestBody DirectOrderRequest req
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    List<Long> optionValueIds = req.getOptionValueIds();
    int optionCount = optionValueIds == null ? 0 : optionValueIds.size();

    ProductSkuRow skuRow;
    if (optionCount == 0) {
      skuRow = skuQueryMapper.findDefaultSkuByProductId(req.getProductId());
    } else {
      skuRow = skuQueryMapper.findSkuByExactOptionMatch(
          req.getProductId(),
          optionValueIds,
          optionCount
      );
    }


    if (skuRow == null) {
      throw new BusinessException("해당 옵션 조합의 SKU를 찾을 수 없습니다.");
    }

    OrderItemCommand item = new OrderItemCommand();
    item.setSkuId(skuRow.getSkuId());
    item.setPrice(skuRow.getPrice());
    item.setQuantity(req.getQuantity());
    ProductRow productRow = productMapper.findByIdForUser(req.getProductId());
    if (productRow == null) {
      throw new BusinessException("상품을 찾을 수 없습니다.");
    }
    item.setProductName(productRow.getName());

    OrderCreateCommand cmd = new OrderCreateCommand();
    cmd.setUserId(principal.getUserId());
    cmd.setOrderCode(req.getOrderCode());
    cmd.setItems(java.util.List.of(item));
    cmd.setReceiverName(req.getReceiverName());
    cmd.setReceiverPhone(req.getReceiverPhone());
    cmd.setZipCode(req.getZipCode());
    cmd.setAddressBase(req.getAddressBase());
    cmd.setAddressDetail(req.getAddressDetail());
    cmd.setUsedPoint(req.getUsedPoint());

    return ApiResponse.success(
        orderService.create(cmd),
        "바로 구매 주문 성공"
    );
  }
}
