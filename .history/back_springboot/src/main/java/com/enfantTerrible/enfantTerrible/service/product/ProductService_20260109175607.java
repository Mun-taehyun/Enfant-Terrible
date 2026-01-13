package com.enfantTerrible.enfantTerrible.service.product;

import java.util.EnumSet;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.ProductSortType;
import com.enfantTerrible.enfantTerrible.common.enums.ProductStatus;
import com.enfantTerrible.enfantTerrible.dto.product.ProductListRequest;
import com.enfantTerrible.enfantTerrible.dto.product.ProductResponse;
import com.enfantTerrible.enfantTerrible.dto.product.ProductRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.product.ProductMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

  private final ProductMapper productMapper;

  /**
   * 사용자 상품 목록 조회
   */
  public List<ProductResponse> getProducts(ProductListRequest req) {

    // 1. 페이징 판단 (Service 책임)
    int page = (req.getPage() == null || req.getPage() < 1) ? 1 : req.getPage();
    int size = (req.getSize() == null || req.getSize() < 1) ? 20 : req.getSize();
    if (size > 100) {
      size = 100;
    }
    int offset = (page - 1) * size;

    // 2. 정렬 해석
    ProductSortType sortType = ProductSortType.from(req.getSort());

    // 3. Mapper 호출 (정렬별 분기)
    List<ProductRow> rows;
    switch (sortType) {
      case PRICE_ASC -> rows = productMapper.findProductsOrderByPriceAsc(
          req.getCategoryId(),
          req.getKeyword(),
          size,
          offset
      );
      case PRICE_DESC -> rows = productMapper.findProductsOrderByPriceDesc(
          req.getCategoryId(),
          req.getKeyword(),
          size,
          offset
      );
      case NAME -> rows = productMapper.findProductsOrderByName(
          req.getCategoryId(),
          req.getKeyword(),
          size,
          offset
      );
      case RECENT -> rows = productMapper.findProductsOrderByRecent(
          req.getCategoryId(),
          req.getKeyword(),
          size,
          offset
      );
      default -> throw new BusinessException("지원하지 않는 정렬 방식입니다.");
    }

    // 4. Row → Response 변환 + 상태 필터
    return rows.stream()
        .filter(row -> {
          ProductStatus status = ProductStatus.from(row.getStatus());
          // 조회 허용: ON_SALE, SOLD_OUT
          return EnumSet.of(
              ProductStatus.ON_SALE,
              ProductStatus.SOLD_OUT
          ).contains(status);
        })
        .map(this::toResponse)
        .toList();
  }

  /**
   * 사용자 상품 상세 조회
   */
  public ProductResponse getProduct(Long productId) {

    ProductRow row = productMapper.findById(productId);
    if (row == null) {
      throw new BusinessException("상품을 찾을 수 없습니다.");
    }

    ProductStatus status = ProductStatus.from(row.getStatus());

    // 조회 불가 상태
    if (status == ProductStatus.STOPPED || status == ProductStatus.HIDDEN) {
      throw new BusinessException("현재 판매중인 상품이 아닙니다.");
    }

    // ON_SALE, SOLD_OUT → 조회 가능
    return toResponse(row);
  }

  /**
   * Row → Response 변환
   */
  private ProductResponse toResponse(ProductRow row) {
    ProductResponse res = new ProductResponse();
    res.setProductId(row.getProductId());
    res.setCategoryId(row.getCategoryId());
    res.setCategoryName(row.getCategoryName());
    res.setName(row.getName());
    res.setDescription(row.getDescription());
    res.setPrice(row.getBasePrice());
    res.setThumbnailUrl(row.getThumbnailUrl());
    return res;
  }
}
