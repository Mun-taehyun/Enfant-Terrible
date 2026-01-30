package com.enfantTerrible.enfantTerrible.service.admin.product;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.FileRefType;
import com.enfantTerrible.enfantTerrible.common.enums.FileRole;
import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.product.*;
import com.enfantTerrible.enfantTerrible.dto.file.FileRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.admin.product.AdminProductMapper;
import com.enfantTerrible.enfantTerrible.mapper.admin.product.AdminProductSkuMapper;
import com.enfantTerrible.enfantTerrible.common.enums.SkuStatus;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminSkuSaveInternalRequest;
import com.enfantTerrible.enfantTerrible.service.file.FileCommandService;
import com.enfantTerrible.enfantTerrible.service.file.FileQueryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminProductService {

  private static final String REF_PRODUCT = "product";
  private static final String ROLE_THUMBNAIL = "THUMBNAIL";
  private static final String ROLE_CONTENT = "CONTENT";

  private final AdminProductMapper productMapper;
  private final AdminProductSkuMapper skuMapper;
  private final FileCommandService fileCommandService;
  private final FileQueryService fileQueryService;

  public AdminPageResponse<AdminProductResponse> getProducts(AdminProductListRequest req) {

    int page = req.getPage() == null || req.getPage() < 1 ? 1 : req.getPage();
    int size = req.getSize() == null || req.getSize() < 1 ? 20 : req.getSize();
    int offset = (page - 1) * size;

    List<AdminProductRow> rows =
        productMapper.findProducts(req, size, offset);
    int totalCount = productMapper.countProducts(req);

    final Map<Long, String> thumbnailUrlByProductId;
    if (rows.isEmpty()) {
      thumbnailUrlByProductId = Map.of();
    } else {
      List<Long> productIds = rows.stream()
          .map(AdminProductRow::getProductId)
          .toList();

      thumbnailUrlByProductId = fileQueryService
          .findFirstFilesByRefIds(REF_PRODUCT, ROLE_THUMBNAIL, productIds)
          .stream()
          .filter(f -> f.getRefId() != null)
          .collect(Collectors.toMap(
              FileRow::getRefId,
              FileRow::getFileUrl,
              (a, b) -> a
          ));
    }

    List<AdminProductResponse> list = rows.stream()
        .map(row -> toResponse(row, thumbnailUrlByProductId.get(row.getProductId())))
        .toList();

    return new AdminPageResponse<>(page, size, totalCount, list);
  }

  public AdminProductResponse getProduct(Long productId) {

    AdminProductRow row = productMapper.findById(productId);
    if (row == null) {
      throw new BusinessException("상품이 존재하지 않습니다.");
    }

    return toResponse(row);
  }

  @Transactional(readOnly = true)
  public AdminProductDetailResponse getProductDetail(Long productId) {
    AdminProductDetailResponse res = productMapper.findDetailById(productId);
    if (res == null) {
      throw new BusinessException("상품이 존재하지 않습니다.");
    }

    List<ProductImageResponse> images = fileQueryService
        .findFilesByRefAndRole(REF_PRODUCT, productId, ROLE_CONTENT)
        .stream()
        .map(this::toProductImageResponse)
        .toList();

    res.setImages(images);
    return res;
  }

  public void create(AdminProductSaveRequest req) {
    productMapper.insert(req);

    if (req.getProductId() == null) {
      throw new BusinessException("상품 생성 키를 가져오지 못했습니다.");
    }

    // 옵션 없는 상품을 위한 기본 SKU 1개 보장
    Long defaultSkuId = skuMapper.findDefaultSkuIdByProductId(req.getProductId());
    if (defaultSkuId == null) {
      AdminSkuSaveInternalRequest skuReq = new AdminSkuSaveInternalRequest(
          req.getProductId(),
          "SKU-" + req.getProductId() + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12),
          req.getBasePrice(),
          0L,
          SkuStatus.STOPPED.name()
      );

      if (skuMapper.insertInternal(skuReq) == 0 || skuReq.getSkuId() == null) {
        throw new BusinessException("기본 SKU 생성에 실패했습니다.");
      }

      skuMapper.refreshProductBasePrice(req.getProductId());
    }
  }

  public void update(Long productId, AdminProductSaveRequest req) {

    AdminProductRow row = productMapper.findById(productId);
    if (row == null) {
      throw new BusinessException("상품이 존재하지 않습니다.");
    }

    productMapper.update(productId, req);

    if (req.getThumbnailFileId() != null) {
      fileCommandService.deleteByRefAndRole(REF_PRODUCT, productId, ROLE_THUMBNAIL);
      // 실제로는 file_id 기준 update로 연결하는 게 더 좋음 (다음 단계)
    }
  }

  public void delete(Long productId) {
    productMapper.softDelete(productId);
    fileCommandService.deleteByRef(REF_PRODUCT, productId);
  }

  @Transactional
  public void replaceThumbnail(Long productId, String thumbnailUrl) {
    if (productId == null) {
      throw new BusinessException("상품 ID가 비어있습니다.");
    }
    if (thumbnailUrl == null || thumbnailUrl.isBlank()) {
      throw new BusinessException("썸네일 URL이 비어있습니다.");
    }

    fileCommandService.deleteByRef(REF_PRODUCT, productId);

    FileRow file = new FileRow();
    file.setRefType(FileRefType.PRODUCT);
    file.setRefId(productId);
    file.setFileRole(FileRole.THUMBNAIL);

    file.setFileUrl(thumbnailUrl);
    file.setOriginalName(thumbnailUrl);
    file.setStoredName(thumbnailUrl);
    file.setFileType("URL");
    file.setFilePath("");

    fileCommandService.save(file);
  }

  public void addContentImages(Long productId, List<String> imageUrls) {
    if (productId == null) {
      throw new BusinessException("상품 ID가 비어있습니다.");
    }

    if (imageUrls == null || imageUrls.isEmpty()) {
      return;
    }

    for (String imageUrl : imageUrls) {
      if (imageUrl == null || imageUrl.isBlank()) {
        continue;
      }

      FileRow file = new FileRow();
      file.setRefType(FileRefType.PRODUCT);
      file.setRefId(productId);
      file.setFileRole(FileRole.CONTENT);

      file.setFileUrl(imageUrl);
      file.setOriginalName(imageUrl);
      file.setStoredName(imageUrl);
      file.setFileType("URL");
      file.setFilePath("");

      fileCommandService.save(file);
    }
  }

  public void deleteContentImage(Long productId, Long fileId) {
    if (productId == null) {
      throw new BusinessException("상품 ID가 비어있습니다.");
    }
    if (fileId == null) {
      throw new BusinessException("fileId가 비어있습니다.");
    }

    FileRow file = fileQueryService.findById(fileId);
    if (file == null) {
      throw new BusinessException("삭제 대상 파일이 없습니다.");
    }

    if (file.getRefType() != FileRefType.PRODUCT) {
      throw new BusinessException("상품 본문 이미지가 아닙니다.");
    }
    if (file.getRefId() == null || !file.getRefId().equals(productId)) {
      throw new BusinessException("상품 ID가 일치하지 않습니다.");
    }
    if (file.getFileRole() != FileRole.CONTENT) {
      throw new BusinessException("상품 본문 이미지가 아닙니다.");
    }

    fileCommandService.deleteById(fileId);
  }

  private AdminProductResponse toResponse(AdminProductRow row) {
    return toResponse(
        row,
        fileQueryService.findFirstFileUrl(REF_PRODUCT, row.getProductId(), ROLE_THUMBNAIL)
    );
  }

  private AdminProductResponse toResponse(AdminProductRow row, String thumbnailUrl) {
    AdminProductResponse res = new AdminProductResponse();
    res.setProductId(row.getProductId());
    res.setProductCode(row.getProductCode());
    res.setCategoryId(row.getCategoryId());
    res.setCategoryName(row.getCategoryName());
    res.setName(row.getName());
    res.setBasePrice(row.getBasePrice());
    res.setStatus(row.getStatus());
    res.setThumbnailUrl(thumbnailUrl);
    return res;
  }

  private ProductImageResponse toProductImageResponse(FileRow row) {
    ProductImageResponse res = new ProductImageResponse();
    res.setFileId(row.getFileId());
    res.setFileUrl(row.getFileUrl());
    res.setOriginalName(row.getOriginalName());
    res.setSortOrder(null);
    return res;
  }
}
