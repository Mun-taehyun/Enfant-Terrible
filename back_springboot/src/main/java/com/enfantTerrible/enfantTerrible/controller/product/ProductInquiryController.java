package com.enfantTerrible.enfantTerrible.controller.product;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.enfantTerrible.enfantTerrible.common.enums.UserRole;
import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.inquiry.ProductInquiryCreateRequest;
import com.enfantTerrible.enfantTerrible.dto.inquiry.ProductInquiryResponse;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.service.file.LocalFileStorageService;
import com.enfantTerrible.enfantTerrible.service.inquiry.ProductInquiryService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class ProductInquiryController {

  private final ProductInquiryService productInquiryService;
  private final LocalFileStorageService localFileStorageService;

  @GetMapping("/products/{productId}/inquiries")
  public ApiResponse<List<ProductInquiryResponse>> list(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @PathVariable Long productId,
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size
  ) {
    Long viewerId = principal == null ? null : principal.getUserId();
    UserRole role = principal == null ? null : principal.getRole();

    return ApiResponse.success(
        productInquiryService.getProductInquiries(productId, viewerId, role, page, size),
        "상품 문의 목록 조회 성공"
    );
  }

  @PostMapping(value = "/products/{productId}/inquiries", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<ProductInquiryResponse> create(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @PathVariable Long productId,
      @RequestPart("req") ProductInquiryCreateRequest req,
      @RequestPart(value = "images", required = false) List<MultipartFile> images
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    if (images != null && !images.isEmpty()) {
      List<String> imageUrls = images.stream()
          .filter(f -> f != null && !f.isEmpty())
          .map(f -> localFileStorageService.save(f, "inquiries"))
          .toList();
      req.setImageUrls(imageUrls);
    }

    return ApiResponse.success(
        productInquiryService.create(principal.getUserId(), productId, req),
        "상품 문의 등록 성공"
    );
  }

  @DeleteMapping("/inquiries/{inquiryId}")
  public ApiResponse<Void> delete(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @PathVariable Long inquiryId
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    productInquiryService.deleteByUser(principal.getUserId(), inquiryId);
    return ApiResponse.success(null, "상품 문의 삭제 성공");
  }
}
