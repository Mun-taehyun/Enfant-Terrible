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
import com.enfantTerrible.enfantTerrible.service.file.FileQueryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

  private static final String REF_TYPE_PRODUCT = "product";
  private static final String FILE_ROLE_THUMBNAIL = "THUMBNAIL";

  private final ProductMapper productMapper;
  private final FileQueryService fileQueryService;
  private final ApplicationEventPublisher eventPublisher;

  /**
   * 사용자 상품 목록 조회
   */
  public List<ProductResponse> getProducts(ProductListRequest req) {

    // 1. 페이징 (리소스 보호 목적)
    int page = (req.getPage() == null || req.getPage() < 1) ? 1 : req.getPage();
    int size = (req.getSize() == null || req.getSize() < 1) ? 20 : req.getSize();
    if (size > 100) {
      size = 100;
    }
    int offset = (page - 1) * size;

    // 2. 정렬 정책 해석
    ProductSortType sortType = ProductSortType.from(req.getSort());

    // 3. 상품 도메인 조회
    List<ProductRow> rows = productMapper.findProducts(
        req.getCategoryId(),
        req.getKeyword(),
        sortType.name(),
        size,
        offset
    );

    // 4. 상태 필터 + Response 변환
    return rows.stream()
        .filter(row -> {
          ProductStatus status = ProductStatus.from(row.getStatus());
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
   * @param productId 상품 ID
   * @param userId    회원 ID (비회원이면 null)
   */
  public ProductResponse getProduct(Long productId, Long userId) {

    ProductRow row = productMapper.findById(productId);
    if (row == null) {
      throw new BusinessException("상품을 찾을 수 없습니다.");
    }

    ProductStatus status = ProductStatus.from(row.getStatus());

    // 조회 불가 상태
    if (status == ProductStatus.STOPPED || status == ProductStatus.HIDDEN) {
      throw new BusinessException("현재 판매중인 상품이 아닙니다.");
    }

    ProductResponse response = toResponse(row);

    // 조회 로그 이벤트 (부가 기능, 실패해도 조회 성공)
    eventPublisher.publishEvent(
        new ProductViewedEvent(userId, productId)
    );

    return response;
  }

  /**
   * Row → Response 변환
   * - 파일 의미 해석은 ProductService 책임
   */
  private ProductResponse toResponse(ProductRow row) {

    ProductResponse res = new ProductResponse();
    res.setProductId(row.getProductId());
    res.setCategoryId(row.getCategoryId());
    res.setCategoryName(row.getCategoryName());
    res.setName(row.getName());
    res.setDescription(row.getDescription());
    res.setPrice(row.getBasePrice());

    // 대표 이미지 (썸네일)
    res.setThumbnailUrl(
        fileQueryService.findFirstFileUrl(
            REF_TYPE_PRODUCT,
            row.getProductId(),
            FILE_ROLE_THUMBNAIL
        )
    );

    return res;
  }
}