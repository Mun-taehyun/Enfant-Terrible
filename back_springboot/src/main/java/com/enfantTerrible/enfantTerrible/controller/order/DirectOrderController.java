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

import jakarta.validation.Valid;
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
      @Valid @RequestBody DirectOrderRequest req
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    List<Long> optionValueIds = req.getOptionValueIds();
    int optionCount = optionValueIds == null ? 0 : optionValueIds.size();

    // 옵션 없는 상품도 있을 수 있으니,
    // optionCount=0이면 "옵션 없는 SKU 찾기" 쿼리가 별도로 필요할 수 있음.
    // (지금은 optionValueIds가 비어있으면 바로 예외 처리로 단순화)
    if (optionCount == 0) {
      throw new BusinessException("옵션 선택이 필요합니다.");
    }

    ProductSkuRow skuRow =
      skuQueryMapper.findSkuByExactOptionMatch(
          req.getProductId(),
          optionValueIds,
          optionCount
      );


    if (skuRow == null) {
      throw new BusinessException("해당 옵션 조합의 SKU를 찾을 수 없습니다.");
    }

    OrderItemCommand item = new OrderItemCommand();
    item.setSkuId(skuRow.getSkuId());
    item.setPrice(skuRow.getPrice());
    item.setQuantity(req.getQuantity());
    // product_name 스냅샷을 위해서는 상품명 조회가 필요함
    // (너 현재 ProductRow/조회 구조로 넣을 수 있음)
    item.setProductName("상품명 스냅샷 필요"); // TODO: product query로 채워

    OrderCreateCommand cmd = new OrderCreateCommand();
    cmd.setUserId(principal.getUserId());
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
