package com.enfantTerrible.enfantTerrible.service.admin.product;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.ProductStatus;
import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminProductListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminProductListResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminProductRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.admin.product.AdminProductMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminProductService {

  private final AdminProductMapper adminProductMapper;

  /**
   * 관리자 상품 목록 조회
   */
  public AdminPageResponse<AdminProductListResponse> getProducts(
      AdminProductListRequest req
  ) {

    // 1. 페이징 계산 (Service 책임)
    int page = (req.getPage() == null || req.getPage() < 1) ? 1 : req.getPage();
    int size = (req.getSize() == null || req.getSize() < 1) ? 20 : req.getSize();

    if (size > 100) {
      size = 100;
    }

    int offset = (page - 1) * size;

    // 2. 상태값 검증 (관리자라서 엄격하게)
    if (req.getStatus() != null && !req.getStatus().isBlank()) {
      try {
        ProductStatus.from(req.getStatus());
      } catch (Exception e) {
        throw new BusinessException("유효하지 않은 상품 상태입니다.");
      }
    }

    // 3. 목록 조회
    List<AdminProductRow> rows = adminProductMapper.findProducts(
        req,
        size,
        offset
    );

    // 4. 전체 개수 조회
    int totalCount = adminProductMapper.countProducts(req);

    // 5. Row → Response 변환
    List<AdminProductListResponse> list = rows.stream()
        .map(this::toResponse)
        .toList();

    // 6. AdminPageResponse 조립
    return new AdminPageResponse<>(
        page,
        size,
        totalCount,
        list
    );
  }

  /**
   * Row → Response 변환
   */
  private AdminProductListResponse toResponse(AdminProductRow row) {

    AdminProductListResponse res = new AdminProductListResponse();

    res.setProductId(row.getProductId());
    res.setProductCode(row.getProductCode());
    res.setName(row.getName());
    res.setBasePrice(row.getBasePrice());
    res.setStatus(row.getStatus());

    res.setCategoryId(row.getCategoryId());
    res.setCategoryName(row.getCategoryName());

    res.setCreatedAt(row.getCreatedAt());

    return res;
  }
}
