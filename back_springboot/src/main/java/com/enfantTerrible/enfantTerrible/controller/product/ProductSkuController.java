package com.enfantTerrible.enfantTerrible.controller.product;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.product.ProductSkuResolveResponse;
import com.enfantTerrible.enfantTerrible.service.product.ProductSkuResolveService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductSkuController {

  private final ProductSkuResolveService skuResolveService;

  /**
   * 옵션 조합 → SKU 확정
   *
   * GET /api/products/{productId}/skus/resolve?optionValueIds=1,2,3
   */
  @GetMapping("/{productId}/skus/resolve")
  public ApiResponse<ProductSkuResolveResponse> resolveSku(
      @PathVariable Long productId,
      @RequestParam String optionValueIds
  ) {

    List<Long> optionIds = Arrays.stream(optionValueIds.split(","))
        .map(String::trim)
        .map(Long::valueOf)
        .collect(Collectors.toList());

    ProductSkuResolveResponse res =
        skuResolveService.resolveSku(productId, optionIds);

    return ApiResponse.success(res, "SKU 확정 성공");
  }
}
