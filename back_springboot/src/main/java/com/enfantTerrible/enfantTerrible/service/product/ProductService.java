package com.enfantTerrible.enfantTerrible.service.product;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.ProductSortType;
import com.enfantTerrible.enfantTerrible.dto.product.ProductDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.product.ProductListRequest;
import com.enfantTerrible.enfantTerrible.dto.product.ProductOptionGroupResponse;
import com.enfantTerrible.enfantTerrible.dto.product.ProductOptionValueResponse;
import com.enfantTerrible.enfantTerrible.dto.product.ProductResponse;
import com.enfantTerrible.enfantTerrible.dto.product.ProductRow;
import com.enfantTerrible.enfantTerrible.dto.product.ProductSkuOptionRow;
import com.enfantTerrible.enfantTerrible.dto.product.ProductSkuResponse;
import com.enfantTerrible.enfantTerrible.event.ProductViewedEvent;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.admin.product.AdminProductOptionGroupMapper;
import com.enfantTerrible.enfantTerrible.mapper.admin.product.AdminProductOptionValueMapper;
import com.enfantTerrible.enfantTerrible.mapper.product.ProductMapper;
import com.enfantTerrible.enfantTerrible.service.file.FileQueryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

  private static final String REF_TYPE_PRODUCT = "product";
  private static final String FILE_ROLE_THUMBNAIL = "THUMBNAIL";
  private static final String FILE_ROLE_CONTENT = "CONTENT";

  private final ProductMapper productMapper;
  private final FileQueryService fileQueryService;
  private final ApplicationEventPublisher eventPublisher;
  private final ObjectProvider<HttpServletRequest> requestProvider;
  private final AdminProductOptionGroupMapper optionGroupMapper;
  private final AdminProductOptionValueMapper optionValueMapper;

  /* =========================
     목록
     ========================= */
  public List<ProductResponse> getProducts(ProductListRequest req) {

    int page = req.getPage() == null || req.getPage() < 1 ? 1 : req.getPage();
    int size = req.getSize() == null || req.getSize() < 1 ? 20 : req.getSize();
    if (size > 100) size = 100;
    int offset = (page - 1) * size;

    List<ProductRow> rows = productMapper.findProducts(
        req.getCategoryId(),
        req.getKeyword(),
        ProductSortType.from(req.getSort()).name(),
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

    // 옵션
    res.setOptionGroups(
        optionGroupMapper.findByProductId(productId).stream().map(g -> {
          ProductOptionGroupResponse og = new ProductOptionGroupResponse();
          og.setOptionGroupId(g.getOptionGroupId());
          og.setName(g.getName());
          og.setValues(
              optionValueMapper.findByGroupId(g.getOptionGroupId()).stream()
                  .map(v -> {
                    ProductOptionValueResponse ov = new ProductOptionValueResponse();
                    ov.setOptionValueId(v.getOptionValueId());
                    ov.setValue(v.getValue());
                    return ov;
                  }).toList()
          );
          return og;
        }).toList()
    );

    // SKU
    List<ProductSkuOptionRow> skuRows =
        productMapper.findSkusWithOptions(productId);

    var skuMap = new java.util.LinkedHashMap<Long, ProductSkuResponse>();

    for (ProductSkuOptionRow r : skuRows) {
      skuMap.computeIfAbsent(r.getSkuId(), k -> {
        ProductSkuResponse s = new ProductSkuResponse();
        s.setSkuId(r.getSkuId());
        s.setPrice(r.getPrice());
        s.setStock(r.getStock());
        s.setStatus(r.getStatus());
        s.setOptionValueIds(new java.util.ArrayList<>());
        return s;
      }).getOptionValueIds().add(r.getOptionValueId());
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
