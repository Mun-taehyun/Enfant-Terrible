package com.enfantTerrible.enfantTerrible.controller.product;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.product.ProductListRequest;
import com.enfantTerrible.enfantTerrible.dto.product.ProductResponse;
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
   * GET /api/products/{productId}
   */
  @GetMapping("/{productId}")
  public ApiResponse<ProductResponse> getProduct(
      @PathVariable Long productId
  ) {

    ProductResponse product = productService.getProduct(productId);

    return ApiResponse.success(
        product,
        "상품 상세 조회 성공"
    );
  }
}
