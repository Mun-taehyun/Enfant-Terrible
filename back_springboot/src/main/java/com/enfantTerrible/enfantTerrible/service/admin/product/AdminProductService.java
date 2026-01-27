package com.enfantTerrible.enfantTerrible.service.admin.product;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.product.*;
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

    List<AdminProductResponse> list = rows.stream()
        .map(this::toResponse)
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
      fileCommandService.deleteByRef(REF_PRODUCT, productId);
      // 실제로는 file_id 기준 update로 연결하는 게 더 좋음 (다음 단계)
    }
  }

  public void delete(Long productId) {
    productMapper.softDelete(productId);
    fileCommandService.deleteByRef(REF_PRODUCT, productId);
  }

  private AdminProductResponse toResponse(AdminProductRow row) {

    AdminProductResponse res = new AdminProductResponse();
    res.setProductId(row.getProductId());
    res.setProductCode(row.getProductCode());
    res.setCategoryId(row.getCategoryId());
    res.setCategoryName(row.getCategoryName());
    res.setName(row.getName());
    res.setBasePrice(row.getBasePrice());
    res.setStatus(row.getStatus());

    res.setThumbnailUrl(
        fileQueryService.findFirstFileUrl(
            REF_PRODUCT,
            row.getProductId(),
            ROLE_THUMBNAIL
        )
    );

    return res;
  }
}
