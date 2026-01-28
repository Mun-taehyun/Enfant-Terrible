package com.enfantTerrible.enfantTerrible.controller.admin.product;

import org.springframework.web.bind.annotation.*;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminSkuListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminSkuResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminSkuSaveRequest;
import com.enfantTerrible.enfantTerrible.service.admin.product.AdminProductSkuService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/products/skus")
public class AdminProductSkuController {

  private final AdminProductSkuService skuService;

  @GetMapping
  public ApiResponse<AdminPageResponse<AdminSkuResponse>> list(
      AdminSkuListRequest req
  ) {
    return ApiResponse.success(
        skuService.getSkus(req),
        "관리자 SKU 목록 조회 성공"
    );
  }

  @GetMapping("/{skuId}")
  public ApiResponse<AdminSkuResponse> detail(
      @PathVariable Long skuId
  ) {
    return ApiResponse.success(
        skuService.getSku(skuId),
        "관리자 SKU 상세 조회 성공"
    );
  }

  @PutMapping("/{skuId}")
  public ApiResponse<Void> update(
      @PathVariable Long skuId,
      @RequestBody AdminSkuSaveRequest req
  ) {
    skuService.update(skuId, req);
    return ApiResponse.successMessage("SKU 수정 성공");
  }
}
