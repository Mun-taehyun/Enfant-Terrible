package com.enfantTerrible.enfantTerrible.service.product;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.dto.product.ProductDiscountRow;
import com.enfantTerrible.enfantTerrible.dto.product.ProductResponse;
import com.enfantTerrible.enfantTerrible.dto.product.ProductRow;
import com.enfantTerrible.enfantTerrible.dto.file.FileRow;
import com.enfantTerrible.enfantTerrible.mapper.product.ProductDiscountMapper;
import com.enfantTerrible.enfantTerrible.mapper.product.ProductMapper;
import com.enfantTerrible.enfantTerrible.mapper.product.ProductRecommendationMapper;
import com.enfantTerrible.enfantTerrible.service.file.FileQueryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductRecommendationService {

  private static final int DEFAULT_LIMIT = 5;
  private static final String REF_TYPE_PRODUCT = "product";
  private static final String FILE_ROLE_THUMBNAIL = "THUMBNAIL";

  private final ProductRecommendationMapper recommendationMapper;
  private final ProductMapper productMapper;
  private final ProductDiscountMapper productDiscountMapper;
  private final ProductDiscountService productDiscountService;
  private final FileQueryService fileQueryService;

  private Float roundRating1(Float rating) {
    if (rating == null) {
      return null;
    }
    return Math.round(rating * 10.0f) / 10.0f;
  }

  public List<ProductResponse> getRecommendations(Long userId) {
    int limit = DEFAULT_LIMIT;

    List<Long> productIds;
    if (userId != null) {
      productIds = recommendationMapper.findRecommendedProductIdsByUserId(userId, limit);
      if (productIds == null || productIds.isEmpty()) {
        productIds = recommendationMapper.findBestSellingProductIds(limit);
      }
    } else {
      productIds = recommendationMapper.findBestSellingProductIds(limit);
    }

    if (productIds == null || productIds.isEmpty()) {
      return Collections.emptyList();
    }

    List<ProductRow> rows = productMapper.findProductsByIds(productIds);
    if (rows == null || rows.isEmpty()) {
      return Collections.emptyList();
    }

    Map<Long, ProductRow> rowMap = rows.stream()
        .collect(Collectors.toMap(ProductRow::getProductId, Function.identity(), (a, b) -> a));

    List<ProductDiscountRow> discounts = productDiscountMapper.findActiveByProductIds(productIds);
    Map<Long, ProductDiscountRow> discountMap = discounts == null ? Map.of()
        : discounts.stream().collect(Collectors.toMap(ProductDiscountRow::getProductId, Function.identity(), (a, b) -> a));

    Map<Long, String> thumbnailUrlMap = new HashMap<>();
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

    return productIds.stream()
        .map(rowMap::get)
        .filter(r -> r != null)
        .map(r -> {
          ProductResponse res = new ProductResponse();
          res.setProductId(r.getProductId());
          res.setCategoryId(r.getCategoryId());
          res.setCategoryName(r.getCategoryName());
          res.setName(r.getName());
          res.setDescription(r.getDescription());
          res.setPrice(r.getMinSkuPrice());

          ProductDiscountRow d = discountMap.get(r.getProductId());
          if (d != null) {
            res.setDiscountType(d.getDiscountType());
            res.setDiscountValue(d.getDiscountValue());
            res.setDiscountedPrice(
                productDiscountService.applyDiscount(
                    r.getMinSkuPrice() == null ? 0L : r.getMinSkuPrice(),
                    d.getDiscountType(),
                    d.getDiscountValue()
                )
            );
          } else {
            res.setDiscountedPrice(r.getMinSkuPrice());
          }

          res.setAverageRating(roundRating1(r.getAverageRating()));
          res.setReviewCount(r.getReviewCount());

          res.setThumbnailUrl(thumbnailUrlMap.get(r.getProductId()));

          return res;
        })
        .toList();
  }
}
