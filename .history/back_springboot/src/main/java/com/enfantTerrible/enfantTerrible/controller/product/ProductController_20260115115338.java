package com.enfantTerrible.enfantTerrible.controller.product;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.product.ProductDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.product.ProductListRequest;
import com.enfantTerrible.enfantTerrible.dto.product.ProductResponse;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.service.product.ProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {

  private final ProductService productService;

  /**
   * 사용자 상품 목록 조회
   *
   * GET /api/products
   * - page
   * - size
   * - categoryId
   * - keyword
   * - sort
   */
  @GetMapping
  public ApiResponse<List<ProductResponse>> getProducts(ProductListRequest req) {

    List<ProductResponse> products = productService.getProducts(req);

    return ApiResponse.success(
        products,
        "상품 목록 조회 성공"
    );
  }

  /**
   * 사용자 상품 상세 조회
   *
   * - 회원 / 비회원 모두 접근 가능
   * - 실제 상세 조회 시에만 로그 기록
   */
  @GetMapping("/{productId}")
  public ApiResponse<ProductDetailResponse> getProductDetail(
      @PathVariable Long productId,
      @AuthenticationPrincipal CustomUserPrincipal principal
  ) {
    Long userId = principal != null ? principal.getUserId() : null;
    return ApiResponse.success(
        productService.getProductDetail(productId, userId),
        "상품 상세 조회 성공"
    );
  }
}
