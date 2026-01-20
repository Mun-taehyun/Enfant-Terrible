package com.enfantTerrible.enfantTerrible.service.product;

import java.util.EnumSet;
import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.ProductSortType;
import com.enfantTerrible.enfantTerrible.common.enums.ProductStatus;
import com.enfantTerrible.enfantTerrible.dto.product.ProductListRequest;
import com.enfantTerrible.enfantTerrible.dto.product.ProductResponse;
import com.enfantTerrible.enfantTerrible.dto.product.ProductRow;
import com.enfantTerrible.enfantTerrible.event.ProductViewedEvent;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.product.ProductMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

  private final ProductMapper productMapper;
  private final ApplicationEventPublisher eventPublisher;

  /**
   * 사용자 상품 목록 조회
   */
  public List<ProductResponse> getProducts(ProductListRequest req) {

    // 1. 페이징 판단 (리소스 보호)
    int page = (req.getPage() == null || req.getPage() < 1) ? 1 : req.getPage();
    int size = (req.getSize() == null || req.getSize() < 1) ? 20 : req.getSize();
    if (size > 100) {
      size = 100;
    }
    int offset = (page - 1) * size;

    // 2. 정렬 해석 (정책)
    ProductSortType sortType = ProductSortType.from(req.getSort());

    // 3. 단일 Mapper 호출
    List<ProductRow> rows = productMapper.findProducts(
        req.getCategoryId(),
        req.getKeyword(),
        sortType.name(), // enum → 안전한 문자열
        size,
        offset
    );

    // 4. 상태 필터 + Row → Response
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
   *
   * @param productId 조회 대상 상품
   * @param userId    회원 ID (비회원이면 null)
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

    // Row → Response
    ProductResponse response = toResponse(row);

    // 조회 로그 이벤트 발행 (부가 기능)
    // - 실패해도 조회는 성공해야 함
    eventPublisher.publishEvent(
        new ProductViewedEvent(userId, productId)
    );

    return response;
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
