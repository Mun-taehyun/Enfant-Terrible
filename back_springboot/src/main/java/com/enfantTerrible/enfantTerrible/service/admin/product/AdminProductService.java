package com.enfantTerrible.enfantTerrible.service.admin.product;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.product.*;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.admin.product.AdminProductMapper;
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
