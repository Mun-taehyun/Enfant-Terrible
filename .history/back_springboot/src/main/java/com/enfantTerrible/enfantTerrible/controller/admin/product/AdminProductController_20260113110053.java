package com.enfantTerrible.enfantTerrible.controller.admin.product;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminProductListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminProductListResponse;
import com.enfantTerrible.enfantTerrible.service.admin.product.AdminProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

  private final AdminProductService adminProductService;

  /**
   * 관리자 상품 목록 조회
   */
  @GetMapping
  public ApiResponse<AdminPageResponse<AdminProductListResponse>> getProducts(
      AdminProductListRequest req
  ) {

    return ApiResponse.success(
        adminProductService.getProducts(req),
        "관리자 상품 목록 조회 성공"
    );
  }
}
