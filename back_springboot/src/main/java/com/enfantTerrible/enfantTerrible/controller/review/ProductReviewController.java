package com.enfantTerrible.enfantTerrible.controller.review;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.review.ProductReviewCreateRequest;
import com.enfantTerrible.enfantTerrible.dto.review.ProductReviewResponse;
import com.enfantTerrible.enfantTerrible.dto.review.ProductReviewUpdateRequest;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.service.review.ProductReviewService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class ProductReviewController {

  private final ProductReviewService productReviewService;

  @GetMapping("/products/{productId}/reviews")
  public ApiResponse<List<ProductReviewResponse>> getProductReviews(
      @PathVariable Long productId,
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size
  ) {
    return ApiResponse.success(
        productReviewService.getProductReviews(productId, page, size),
        "상품 리뷰 목록 조회 성공"
    );
  }

  @PostMapping("/products/{productId}/reviews")
  public ApiResponse<ProductReviewResponse> create(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @PathVariable Long productId,
      @Valid @RequestBody ProductReviewCreateRequest req
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    return ApiResponse.success(
        productReviewService.create(principal.getUserId(), productId, req),
        "리뷰 작성 성공"
    );
  }

  @PutMapping("/reviews/{reviewId}")
  public ApiResponse<ProductReviewResponse> update(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @PathVariable Long reviewId,
      @Valid @RequestBody ProductReviewUpdateRequest req
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    return ApiResponse.success(
        productReviewService.update(principal.getUserId(), reviewId, req),
        "리뷰 수정 성공"
    );
  }

  @DeleteMapping("/reviews/{reviewId}")
  public ApiResponse<Void> delete(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @PathVariable Long reviewId
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    productReviewService.delete(principal.getUserId(), reviewId);
    return ApiResponse.success(null, "리뷰 삭제 성공");
  }
}
