package com.enfantTerrible.enfantTerrible.service.product;

import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.ProductSortType;
import com.enfantTerrible.enfantTerrible.dto.product.ProductDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.product.ProductOptionGroupResponse;
import com.enfantTerrible.enfantTerrible.dto.product.ProductOptionGroupRow;
import com.enfantTerrible.enfantTerrible.dto.product.ProductOptionValueResponse;
import com.enfantTerrible.enfantTerrible.dto.product.ProductOptionValueRow;
import com.enfantTerrible.enfantTerrible.dto.product.ProductResponse;
import com.enfantTerrible.enfantTerrible.dto.product.ProductRow;
import com.enfantTerrible.enfantTerrible.dto.product.ProductSkuOptionRow;
import com.enfantTerrible.enfantTerrible.dto.product.ProductSkuResponse;
import com.enfantTerrible.enfantTerrible.event.ProductViewedEvent;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.product.ProductMapper;
import com.enfantTerrible.enfantTerrible.mapper.product.ProductOptionQueryMapper;
import com.enfantTerrible.enfantTerrible.service.file.FileQueryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductQueryService {

  private static final String REF_TYPE_PRODUCT = "product";
  private static final String FILE_ROLE_THUMBNAIL = "THUMBNAIL";
  private static final String FILE_ROLE_CONTENT = "CONTENT";

  private final ProductMapper productMapper;
  private final ProductOptionQueryMapper productOptionQueryMapper;
  private final FileQueryService fileQueryService;
  private final ApplicationEventPublisher eventPublisher;

  /* =========================
     목록 (Product 중심)
     - price = product.base_price (최저 SKU 가격 캐시)
     ========================= */
  public List<ProductResponse> getProducts(
      Integer pageParam,
      Integer sizeParam,
      Long categoryId,
      String keyword,
      String sort
  ) {

    int page = (pageParam == null || pageParam < 1) ? 1 : pageParam;
    int size = (sizeParam == null || sizeParam < 1) ? 20 : sizeParam;
    if (size > 100) size = 100;

    int offset = (page - 1) * size;

    ProductSortType sortType = ProductSortType.from(sort);
    if (sortType == null) {
      throw new BusinessException("정렬 조건이 올바르지 않습니다.");
    }

    List<ProductRow> rows = productMapper.findProducts(
        categoryId,
        keyword,
        sortType.name(),
        size,
        offset
    );

    return rows.stream().map(row -> {
      ProductResponse res = new ProductResponse();
      res.setProductId(row.getProductId());
      res.setCategoryId(row.getCategoryId());
      res.setCategoryName(row.getCategoryName());
      res.setName(row.getName());
      res.setDescription(row.getDescription());

      // ⭐ 1안: base_price = 최저 SKU 가격 캐시
      res.setPrice(row.getMinSkuPrice());

      res.setThumbnailUrl(
          fileQueryService.findFirstFileUrl(
              REF_TYPE_PRODUCT,
              row.getProductId(),
              FILE_ROLE_THUMBNAIL
          )
      );
      return res;
    }).toList();
  }

  /* =========================
     상세 (SKU-aware)
     - 사용자 노출 조건 강제
     - 옵션 조회: 사용자용 QueryMapper 사용 (AdminMapper 참조 제거)
     - SKU 옵션: LEFT JOIN + ORDER BY
     ========================= */
  public ProductDetailResponse getProductDetail(Long productId, Long userId) {

    ProductRow row = productMapper.findByIdForUser(productId);
    if (row == null) {
      throw new BusinessException("상품을 찾을 수 없습니다.");
    }

    ProductDetailResponse res = new ProductDetailResponse();
    res.setProductId(row.getProductId());
    res.setCategoryId(row.getCategoryId());
    res.setCategoryName(row.getCategoryName());
    res.setName(row.getName());
    res.setDescription(row.getDescription());

    res.setThumbnailUrl(
        fileQueryService.findFirstFileUrl(
            REF_TYPE_PRODUCT,
            productId,
            FILE_ROLE_THUMBNAIL
        )
    );

    res.setContentImageUrls(
        fileQueryService.findFileUrls(
            REF_TYPE_PRODUCT,
            productId,
            FILE_ROLE_CONTENT
        )
    );

    // 옵션 그룹 + 값 (사용자 전용 QueryMapper)
    List<ProductOptionGroupRow> groupRows =
        productOptionQueryMapper.findOptionGroupsByProductId(productId);

    res.setOptionGroups(
        groupRows.stream().map(g -> {
          ProductOptionGroupResponse og = new ProductOptionGroupResponse();
          og.setOptionGroupId(g.getOptionGroupId());
          og.setName(g.getName());

          List<ProductOptionValueRow> valueRows =
              productOptionQueryMapper.findOptionValuesByGroupId(g.getOptionGroupId());

          og.setValues(
              valueRows.stream().map(v -> {
                ProductOptionValueResponse ov = new ProductOptionValueResponse();
                ov.setOptionValueId(v.getOptionValueId());
                ov.setValue(v.getValue());
                return ov;
              }).toList()
          );

          return og;
        }).toList()
    );

    // SKU + 옵션
    List<ProductSkuOptionRow> skuRows =
        productMapper.findSkusWithOptions(productId);

    var skuMap = new java.util.LinkedHashMap<Long, ProductSkuResponse>();

    for (ProductSkuOptionRow r : skuRows) {
      ProductSkuResponse sku = skuMap.computeIfAbsent(r.getSkuId(), k -> {
        ProductSkuResponse s = new ProductSkuResponse();
        s.setSkuId(r.getSkuId());
        s.setPrice(r.getPrice());
        s.setStock(r.getStock());
        s.setStatus(r.getStatus());
        s.setOptionValueIds(new java.util.ArrayList<>());
        return s;
      });

      // LEFT JOIN 대비: 옵션 없는 SKU면 null일 수 있음
      if (r.getOptionValueId() != null) {
        sku.getOptionValueIds().add(r.getOptionValueId());
      }
    }

    res.setSkus(new java.util.ArrayList<>(skuMap.values()));

    eventPublisher.publishEvent(new ProductViewedEvent(userId, productId));

    return res;
  }
}
