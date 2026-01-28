package com.enfantTerrible.enfantTerrible.controller.review;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.review.ProductReviewCreateRequest;
import com.enfantTerrible.enfantTerrible.dto.review.ProductReviewResponse;
import com.enfantTerrible.enfantTerrible.dto.review.ProductReviewUpdateRequest;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.service.file.LocalFileStorageService;
import com.enfantTerrible.enfantTerrible.service.review.ProductReviewService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class ProductReviewController {

  private final ProductReviewService productReviewService;
  private final LocalFileStorageService localFileStorageService;

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

  @PostMapping(value = "/products/{productId}/reviews", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<ProductReviewResponse> create(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @PathVariable Long productId,
      @RequestPart("req") ProductReviewCreateRequest req,
      @RequestPart(value = "images", required = false) List<MultipartFile> images
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    if (images != null && !images.isEmpty()) {
      List<String> imageUrls = images.stream()
          .filter(f -> f != null && !f.isEmpty())
          .map(f -> localFileStorageService.save(f, "reviews"))
          .toList();
      req.setImageUrls(imageUrls);
    }

    return ApiResponse.success(
        productReviewService.create(principal.getUserId(), productId, req),
        "리뷰 작성 성공"
    );
  }

  @PutMapping(value = "/reviews/{reviewId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<ProductReviewResponse> update(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @PathVariable Long reviewId,
      @RequestPart("req") ProductReviewUpdateRequest req,
      @RequestPart(value = "images", required = false) List<MultipartFile> images
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    if (images != null) {
      List<String> imageUrls = images.stream()
          .filter(f -> f != null && !f.isEmpty())
          .map(f -> localFileStorageService.save(f, "reviews"))
          .toList();
      req.setImageUrls(imageUrls);
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
