package com.enfantTerrible.enfantTerrible.controller.admin.product;

import org.springframework.web.bind.annotation.*;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.product.*;
import com.enfantTerrible.enfantTerrible.service.admin.product.AdminProductService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/products")
public class AdminProductController {

  private final AdminProductService productService;

  @GetMapping
  public ApiResponse<AdminPageResponse<AdminProductResponse>> list(
      AdminProductListRequest req
  ) {
    return ApiResponse.success(
        productService.getProducts(req),
        "관리자 상품 목록 조회 성공"
    );
  }

  @GetMapping("/{productId}")
  public ApiResponse<AdminProductResponse> detail(
      @PathVariable Long productId
  ) {
    return ApiResponse.success(
        productService.getProduct(productId),
        "관리자 상품 상세 조회 성공"
    );
  }

  @PostMapping
  public ApiResponse<Void> create(
      @Valid @RequestBody AdminProductSaveRequest req
  ) {
    productService.create(req);
    return ApiResponse.successMessage("상품 등록 성공");
  }

  @PutMapping("/{productId}")
  public ApiResponse<Void> update(
      @PathVariable Long productId,
      @Valid @RequestBody AdminProductSaveRequest req
  ) {
    productService.update(productId, req);
    return ApiResponse.successMessage("상품 수정 성공");
  }

  @DeleteMapping("/{productId}")
  public ApiResponse<Void> delete(
      @PathVariable Long productId
  ) {
    productService.delete(productId);
    return ApiResponse.successMessage("상품 삭제 성공");
  }
}
