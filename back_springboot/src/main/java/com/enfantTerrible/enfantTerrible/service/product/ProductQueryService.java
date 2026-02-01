package com.enfantTerrible.enfantTerrible.service.product;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.ProductSortType;
import com.enfantTerrible.enfantTerrible.common.response.PageResponse;
import com.enfantTerrible.enfantTerrible.dto.file.FileRow;
import com.enfantTerrible.enfantTerrible.dto.product.ProductDiscountRow;
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
import com.enfantTerrible.enfantTerrible.mapper.product.ProductDiscountMapper;
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
  private final ProductDiscountMapper productDiscountMapper;
  private final ProductDiscountService productDiscountService;
  private final FileQueryService fileQueryService;
  private final ApplicationEventPublisher eventPublisher;
  private final ObjectProvider<HttpServletRequest> requestProvider;

  private Float roundRating1(Float rating) {
    if (rating == null) {
      return null;
    }
    return Math.round(rating * 10.0f) / 10.0f;
  }

  /* =========================
     목록 (Product 중심)
     - price = product.base_price (최저 SKU 가격 캐시)
     ========================= */
  public PageResponse<ProductResponse> getProducts(
      Integer pageParam,
      Integer sizeParam,
      Long categoryId,
      String keyword,
      Long minPrice,
      Long maxPrice,
      Float minRating,
      Boolean hasDiscount,
      String sort
  ) {

    int page = (pageParam == null || pageParam < 1) ? 1 : pageParam;
    int size = (sizeParam == null || sizeParam < 1) ? 20 : sizeParam;
    if (size > 100) size = 100;

    int offset = (page - 1) * size;

    int totalCount = productMapper.countProducts(
        categoryId,
        keyword,
        minPrice,
        maxPrice,
        minRating,
        hasDiscount
    );

    ProductSortType sortType = ProductSortType.from(sort);
    if (sortType == null) {
      throw new BusinessException("정렬 조건이 올바르지 않습니다.");
    }

    List<ProductRow> rows = productMapper.findProducts(
        categoryId,
        keyword,
        minPrice,
        maxPrice,
        minRating,
        hasDiscount,
        sortType.name(),
        size,
        offset
    );

    Map<Long, ProductDiscountRow> discountMap = new HashMap<>();
    Map<Long, String> thumbnailUrlMap = new HashMap<>();
    if (!rows.isEmpty()) {
      List<Long> productIds = rows.stream().map(ProductRow::getProductId).toList();
      List<ProductDiscountRow> discounts = productDiscountMapper.findActiveByProductIds(productIds);
      for (ProductDiscountRow d : discounts) {
        discountMap.put(d.getProductId(), d);
      }

      List<FileRow> thumbnails = fileQueryService.findFirstFilesByRefIds(
          REF_TYPE_PRODUCT,
          FILE_ROLE_THUMBNAIL,
          productIds
      );
      for (FileRow f : thumbnails) {
        if (f != null && f.getRefId() != null) {
          thumbnailUrlMap.put(f.getRefId(), f.getFileUrl());
        }
      }
    }

    List<ProductResponse> items = rows.stream().map(row -> {
      ProductResponse res = new ProductResponse();
      res.setProductId(row.getProductId());
      res.setCategoryId(row.getCategoryId());
      res.setCategoryName(row.getCategoryName());
      res.setName(row.getName());
      res.setDescription(row.getDescription());

      // ⭐ 1안: base_price = 최저 SKU 가격 캐시
      res.setPrice(row.getMinSkuPrice());

      ProductDiscountRow discount = discountMap.get(row.getProductId());
      if (discount != null) {
        res.setDiscountType(discount.getDiscountType());
        res.setDiscountValue(discount.getDiscountValue());
        res.setDiscountedPrice(
            productDiscountService.applyDiscount(
                row.getMinSkuPrice() == null ? 0L : row.getMinSkuPrice(),
                discount.getDiscountType(),
                discount.getDiscountValue()
            )
        );
      } else {
        res.setDiscountedPrice(row.getMinSkuPrice());
      }

      res.setAverageRating(roundRating1(row.getAverageRating()));
      res.setReviewCount(row.getReviewCount());

      res.setThumbnailUrl(thumbnailUrlMap.get(row.getProductId()));
      return res;
    }).toList();

    return new PageResponse<>(page, size, totalCount, items);
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

    ProductDiscountRow discount = productDiscountMapper.findActiveByProductId(productId);
    if (discount != null) {
      res.setDiscountType(discount.getDiscountType());
      res.setDiscountValue(discount.getDiscountValue());
    }

    res.setAverageRating(roundRating1(row.getAverageRating()));
    res.setReviewCount(row.getReviewCount());

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

    Map<Long, List<ProductOptionValueRow>> valueRowsByGroupId = new HashMap<>();
    if (!groupRows.isEmpty()) {
      List<Long> groupIds = groupRows.stream().map(ProductOptionGroupRow::getOptionGroupId).toList();
      List<ProductOptionValueRow> allValueRows =
          productOptionQueryMapper.findOptionValuesByGroupIds(groupIds);

      for (ProductOptionValueRow v : allValueRows) {
        if (v == null || v.getOptionGroupId() == null) continue;
        valueRowsByGroupId
            .computeIfAbsent(v.getOptionGroupId(), k -> new java.util.ArrayList<>())
            .add(v);
      }
    }

    res.setOptionGroups(
        groupRows.stream().map(g -> {
          ProductOptionGroupResponse og = new ProductOptionGroupResponse();
          og.setOptionGroupId(g.getOptionGroupId());
          og.setName(g.getName());

          List<ProductOptionValueRow> valueRows =
              valueRowsByGroupId.getOrDefault(g.getOptionGroupId(), java.util.Collections.emptyList());

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
        if (discount != null) {
          s.setDiscountedPrice(
              productDiscountService.applyDiscount(
                  r.getPrice() == null ? 0L : r.getPrice(),
                  discount.getDiscountType(),
                  discount.getDiscountValue()
              )
          );
        } else {
          s.setDiscountedPrice(r.getPrice());
        }
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

    HttpServletRequest request = requestProvider.getIfAvailable();
    String sessionId = request != null && request.getSession(false) != null
        ? request.getSession(false).getId()
        : "";
    String clientIp = getClientIp(request);
    String userAgent = request != null ? request.getHeader("User-Agent") : "";

    eventPublisher.publishEvent(
        new ProductViewedEvent(userId, productId, sessionId, clientIp, userAgent)
    );

    return res;
  }

  private String getClientIp(HttpServletRequest request) {
    if (request == null) {
      return "";
    }
    String forwarded = request.getHeader("X-Forwarded-For");
    if (forwarded != null && !forwarded.isBlank()) {
      return forwarded.split(",")[0];
    }
    return request.getRemoteAddr();
  }
}
