package com.enfantTerrible.enfantTerrible.service.review;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.FileRefType;
import com.enfantTerrible.enfantTerrible.common.enums.FileRole;
import com.enfantTerrible.enfantTerrible.dto.review.ProductReviewCreateRequest;
import com.enfantTerrible.enfantTerrible.dto.review.ProductReviewResponse;
import com.enfantTerrible.enfantTerrible.dto.review.ProductReviewRow;
import com.enfantTerrible.enfantTerrible.dto.review.ProductReviewUpdateRequest;
import com.enfantTerrible.enfantTerrible.dto.file.FileRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.product.ProductMapper;
import com.enfantTerrible.enfantTerrible.mapper.review.ProductReviewMapper;
import com.enfantTerrible.enfantTerrible.service.file.FileCommandService;
import com.enfantTerrible.enfantTerrible.service.file.FileQueryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductReviewService {

  private static final String REF_TYPE_REVIEW = "review";
  private static final String FILE_ROLE_CONTENT = "CONTENT";

  private final ProductReviewMapper productReviewMapper;
  private final ProductMapper productMapper;

  private final FileCommandService fileCommandService;
  private final FileQueryService fileQueryService;

  @Transactional(readOnly = true)
  public List<ProductReviewResponse> getProductReviews(Long productId, Integer pageParam, Integer sizeParam) {

    int page = (pageParam == null || pageParam < 1) ? 1 : pageParam;
    int size = (sizeParam == null || sizeParam < 1) ? 20 : sizeParam;
    if (size > 100) size = 100;
    int offset = (page - 1) * size;

    return productReviewMapper.findByProductId(productId, size, offset)
        .stream()
        .map(this::toResponse)
        .toList();
  }

  public ProductReviewResponse create(Long userId, Long productId, ProductReviewCreateRequest req) {

    int purchased = productReviewMapper.existsPurchase(userId, req.getOrderId(), productId);
    if (purchased != 1) {
      throw new BusinessException("구매한 상품만 리뷰를 작성할 수 있습니다.");
    }

    int dup = productReviewMapper.existsByOrderAndProduct(req.getOrderId(), productId);
    if (dup == 1) {
      throw new BusinessException("이미 해당 주문에 대한 리뷰가 존재합니다.");
    }

    productReviewMapper.insert(userId, productId, req.getOrderId(), req.getRating(), req.getContent());
    Long reviewId = productReviewMapper.findLastInsertId();

    if (reviewId != null && req.getImageUrls() != null && !req.getImageUrls().isEmpty()) {
      replaceReviewImages(reviewId, req.getImageUrls());
    }

    ProductReviewRow row = productReviewMapper.findById(reviewId);
    if (row == null) {
      throw new BusinessException("리뷰 생성에 실패했습니다.");
    }

    productMapper.refreshReviewCache(productId);

    return toResponse(row);
  }

  public ProductReviewResponse update(Long userId, Long reviewId, ProductReviewUpdateRequest req) {

    ProductReviewRow row = productReviewMapper.findById(reviewId);
    if (row == null || row.getDeletedAt() != null) {
      throw new BusinessException("리뷰를 찾을 수 없습니다.");
    }

    if (row.getUserId() == null || !row.getUserId().equals(userId)) {
      throw new BusinessException("리뷰 수정 권한이 없습니다.");
    }

    int updated = productReviewMapper.update(reviewId, req.getRating(), req.getContent());
    if (updated == 0) {
      throw new BusinessException("리뷰 수정에 실패했습니다.");
    }

    if (req.getImageUrls() != null) {
      replaceReviewImages(reviewId, req.getImageUrls());
    }

    productMapper.refreshReviewCache(row.getProductId());

    ProductReviewRow updatedRow = productReviewMapper.findById(reviewId);
    return toResponse(updatedRow);
  }

  public void delete(Long userId, Long reviewId) {

    ProductReviewRow row = productReviewMapper.findById(reviewId);
    if (row == null || row.getDeletedAt() != null) {
      throw new BusinessException("리뷰를 찾을 수 없습니다.");
    }

    if (row.getUserId() == null || !row.getUserId().equals(userId)) {
      throw new BusinessException("리뷰 삭제 권한이 없습니다.");
    }

    int deleted = productReviewMapper.softDelete(reviewId);
    if (deleted == 0) {
      throw new BusinessException("리뷰 삭제에 실패했습니다.");
    }

    fileCommandService.deleteByRef(REF_TYPE_REVIEW, reviewId);

    productMapper.refreshReviewCache(row.getProductId());
  }

  private ProductReviewResponse toResponse(ProductReviewRow row) {
    if (row == null) {
      return null;
    }

    ProductReviewResponse res = new ProductReviewResponse();
    res.setReviewId(row.getReviewId());
    res.setUserId(row.getUserId());
    res.setProductId(row.getProductId());
    res.setOrderId(row.getOrderId());
    res.setRating(row.getRating());
    res.setContent(row.getContent());
    res.setImageUrls(fileQueryService.findFileUrls(REF_TYPE_REVIEW, row.getReviewId(), FILE_ROLE_CONTENT));
    res.setCreatedAt(row.getCreatedAt());
    res.setUpdatedAt(row.getUpdatedAt());
    return res;
  }

  private void replaceReviewImages(Long reviewId, List<String> imageUrls) {
    fileCommandService.deleteByRef(REF_TYPE_REVIEW, reviewId);

    if (imageUrls == null || imageUrls.isEmpty()) {
      return;
    }

    for (String imageUrl : imageUrls) {
      if (imageUrl == null || imageUrl.isBlank()) {
        continue;
      }

      FileRow file = new FileRow();
      file.setRefType(FileRefType.REVIEW);
      file.setRefId(reviewId);
      file.setFileRole(FileRole.CONTENT);

      file.setFileUrl(imageUrl);
      file.setOriginalName(imageUrl);
      file.setStoredName(imageUrl);
      file.setFileType("URL");
      file.setFilePath("");

      fileCommandService.save(file);
    }
  }
}
