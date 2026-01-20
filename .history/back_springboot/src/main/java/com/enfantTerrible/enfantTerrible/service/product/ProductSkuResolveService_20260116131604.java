package com.enfantTerrible.enfantTerrible.service.product;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.dto.product.ProductSkuResolveResponse;
import com.enfantTerrible.enfantTerrible.dto.product.ProductSkuRow;
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

    ProductSkuRow sku =
        skuQueryMapper.findSkuByExactOptionMatch(
            productId,
            optionValueIds,
            optionValueIds.size()
        );

    if (sku == null) {
      throw new BusinessException("선택한 옵션 조합에 해당하는 상품이 없습니다.");
    }

    ProductSkuResolveResponse res = new ProductSkuResolveResponse();
    res.setSkuId(sku.getSkuId());
    res.setPrice(sku.getPrice());
    res.setStock(sku.getStock());
    res.setStatus(sku.getStatus());

    return res;
  }
}
