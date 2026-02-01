package com.enfantTerrible.enfantTerrible.controller.product;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.common.response.PageResponse;
import com.enfantTerrible.enfantTerrible.dto.product.ProductDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.product.ProductResponse;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.service.product.ProductQueryService;
import com.enfantTerrible.enfantTerrible.service.product.ProductRecommendationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {

  private final ProductQueryService productQueryService;
  private final ProductRecommendationService productRecommendationService;

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
  public ApiResponse<PageResponse<ProductResponse>> getProducts(
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size,
      @RequestParam(required = false) Long categoryId,
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) Long minPrice,
      @RequestParam(required = false) Long maxPrice,
      @RequestParam(required = false) Float minRating,
      @RequestParam(required = false) Boolean hasDiscount,
      @RequestParam(required = false) String sort
  ) {

    PageResponse<ProductResponse> products =
        productQueryService.getProducts(
            page,
            size,
            categoryId,
            keyword,
            minPrice,
            maxPrice,
            minRating,
            hasDiscount,
            sort
        );

    return ApiResponse.success(
        products,
        "상품 목록 조회 성공"
    );
  }

  @GetMapping("/recommendations")
  public ApiResponse<List<ProductResponse>> getRecommendations(
      @AuthenticationPrincipal CustomUserPrincipal principal
  ) {
    Long userId = principal != null ? principal.getUserId() : null;

    return ApiResponse.success(
        productRecommendationService.getRecommendations(userId),
        "추천 상품 조회 성공"
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
        productQueryService.getProductDetail(productId, userId),
        "상품 상세 조회 성공"
    );
  }
}
