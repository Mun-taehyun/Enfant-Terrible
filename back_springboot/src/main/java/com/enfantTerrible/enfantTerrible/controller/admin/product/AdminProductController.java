package com.enfantTerrible.enfantTerrible.controller.admin.product;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.product.*;
import com.enfantTerrible.enfantTerrible.service.admin.product.AdminProductService;
import com.enfantTerrible.enfantTerrible.service.file.LocalFileStorageService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/products")
public class AdminProductController {

  private final AdminProductService productService;
  private final LocalFileStorageService localFileStorageService;

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
  public ApiResponse<AdminProductDetailResponse> detail(
      @PathVariable Long productId
  ) {
    return ApiResponse.success(
        productService.getProductDetail(productId),
        "관리자 상품 상세 조회 성공"
    );
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<Void> create(
      @RequestPart("req") AdminProductSaveRequest req,
      @RequestPart(value = "image", required = false) MultipartFile image,
      @RequestPart(value = "contentImages", required = false) List<MultipartFile> contentImages
  ) {
    String thumbnailUrl = null;
    if (image != null && !image.isEmpty()) {
      thumbnailUrl = localFileStorageService.save(image, "products");
    }

    List<String> contentImageUrls = new ArrayList<>();
    if (contentImages != null) {
      for (MultipartFile f : contentImages) {
        if (f == null || f.isEmpty()) continue;
        contentImageUrls.add(localFileStorageService.save(f, "products"));
      }
    }

    productService.create(req);
    if (thumbnailUrl != null && req.getProductId() != null) {
      productService.replaceThumbnail(req.getProductId(), thumbnailUrl);
    }
    if (req.getProductId() != null) {
      productService.addContentImages(req.getProductId(), contentImageUrls);
    }
    return ApiResponse.successMessage("상품 등록 성공");
  }

  @PutMapping(value = "/{productId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<Void> update(
      @PathVariable Long productId,
      @RequestPart("req") AdminProductSaveRequest req,
      @RequestPart(value = "image", required = false) MultipartFile image,
      @RequestPart(value = "contentImages", required = false) List<MultipartFile> contentImages
  ) {
    String thumbnailUrl = null;
    if (image != null && !image.isEmpty()) {
      thumbnailUrl = localFileStorageService.save(image, "products");
    }

    List<String> contentImageUrls = new ArrayList<>();
    if (contentImages != null) {
      for (MultipartFile f : contentImages) {
        if (f == null || f.isEmpty()) continue;
        contentImageUrls.add(localFileStorageService.save(f, "products"));
      }
    }

    productService.update(productId, req);
    if (thumbnailUrl != null) {
      productService.replaceThumbnail(productId, thumbnailUrl);
    }
    if (!contentImageUrls.isEmpty()) {
      productService.addContentImages(productId, contentImageUrls);
    }
    return ApiResponse.successMessage("상품 수정 성공");
  }

  @PostMapping(value = "/{productId}/content-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<Void> addContentImages(
      @PathVariable Long productId,
      @RequestPart("images") List<MultipartFile> images
  ) {
    List<String> imageUrls = new ArrayList<>();
    if (images != null) {
      for (MultipartFile f : images) {
        if (f == null || f.isEmpty()) continue;
        imageUrls.add(localFileStorageService.save(f, "products"));
      }
    }

    if (!imageUrls.isEmpty()) {
      productService.addContentImages(productId, imageUrls);
    }

    return ApiResponse.successMessage("본문 이미지 추가 성공");
  }

  @DeleteMapping("/{productId}/content-images/{fileId}")
  public ApiResponse<Void> deleteContentImage(
      @PathVariable Long productId,
      @PathVariable Long fileId
  ) {
    productService.deleteContentImage(productId, fileId);
    return ApiResponse.successMessage("본문 이미지 삭제 성공");
  }

  @DeleteMapping("/{productId}")
  public ApiResponse<Void> delete(
      @PathVariable Long productId
  ) {
    productService.delete(productId);
    return ApiResponse.successMessage("상품 삭제 성공");
  }
}
