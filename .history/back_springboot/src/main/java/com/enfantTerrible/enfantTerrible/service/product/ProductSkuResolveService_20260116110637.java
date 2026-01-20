package com.enfantTerrible.enfantTerrible.service.product;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.dto.product.ProductSkuOptionRow;
import com.enfantTerrible.enfantTerrible.dto.product.ProductSkuResolveResponse;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.product.ProductSkuQueryMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductSkuResolveService {

  private final ProductSkuQueryMapper skuQueryMapper;

  public ProductSkuResolveResponse resolveSku(
      Long productId,
      List<Long> optionValueIds
  ) {

    if (optionValueIds == null || optionValueIds.isEmpty()) {
      throw new BusinessException("옵션을 선택해주세요.");
    }

    List<ProductSkuOptionRow> rows =
        skuQueryMapper.findSkuByExactOptionMatch(
            productId,
            optionValueIds,
            optionValueIds.size()
        );

    if (rows.isEmpty()) {
      throw new BusinessException("선택한 옵션 조합에 해당하는 상품이 없습니다.");
    }

    if (rows.size() > 1) {
      // 데이터 정합성 오류 (관리자 SKU 설계 문제)
      throw new BusinessException("SKU 데이터가 올바르지 않습니다.");
    }

    ProductSkuOptionRow row = rows.get(0);

    ProductSkuResolveResponse res = new ProductSkuResolveResponse();
    res.setSkuId(row.getSkuId());
    res.setPrice(row.getPrice());
    res.setStock(row.getStock());
    res.setStatus(row.getStatus());

    return res;
  }
}
