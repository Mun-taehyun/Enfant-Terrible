package com.enfantTerrible.enfantTerrible.service.admin.product;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.SkuStatus;
import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminSkuListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminSkuResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminSkuRow;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminSkuSaveInternalRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminSkuSaveRequest;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.admin.product.AdminProductSkuMapper;
import com.enfantTerrible.enfantTerrible.mapper.admin.product.AdminProductSkuOptionMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminProductSkuService {

  private final AdminProductSkuMapper skuMapper;
  private final AdminProductSkuOptionMapper skuOptionMapper;

  @Transactional(readOnly = true)
  public AdminPageResponse<AdminSkuResponse> getSkus(AdminSkuListRequest req) {

    int page = req.getPage() == null || req.getPage() < 1 ? 1 : req.getPage();
    int size = req.getSize() == null || req.getSize() < 1 ? 20 : req.getSize();
    int offset = (page - 1) * size;

    List<AdminSkuRow> rows = skuMapper.findSkus(req, size, offset);
    int totalCount = skuMapper.countSkus(req);

    List<AdminSkuResponse> list = rows.stream()
        .map(this::toResponse)
        .toList();

    return new AdminPageResponse<>(page, size, totalCount, list);
  }

  @Transactional(readOnly = true)
  public AdminSkuResponse getSku(Long skuId) {

    AdminSkuRow row = skuMapper.findById(skuId);
    if (row == null) {
      throw new BusinessException("SKU가 존재하지 않습니다.");
    }

    return toResponse(row);
  }

  public void create(AdminSkuSaveRequest req) {

    // 1) 상태 검증 (Service에서 enum 해석)
    SkuStatus status = SkuStatus.from(req.getStatus());
    if (status == null) {
      throw new BusinessException("SKU 상태값이 올바르지 않습니다.");
    }

    // 2) SKU 코드 생성 (충돌 리스크 낮춤)
    String skuCode = generateSkuCode(req.getProductId());

    // 3) insert (generatedKeys로 skuId 받음)
    AdminSkuSaveInternalRequest internalReq =
        new AdminSkuSaveInternalRequest(
            req.getProductId(),
            skuCode,
            req.getPrice(),
            req.getStock(),
            req.getStatus()
        );

    if (skuMapper.insertInternal(internalReq) == 0) {
      throw new BusinessException("SKU 등록에 실패했습니다.");
    }

    if (internalReq.getSkuId() == null) {
      throw new BusinessException("SKU 생성 키를 가져오지 못했습니다.");
    }

    // 4) 옵션 매핑
    mapOptions(internalReq.getSkuId(), req.getOptionValueIds());

    // 5) ⭐ 1안: product.base_price = MIN(sku.price) 동기화
    refreshProductBasePrice(req.getProductId());
  }

  public void update(Long skuId, AdminSkuSaveRequest req) {

    SkuStatus status = SkuStatus.from(req.getStatus());
    if (status == null) {
      throw new BusinessException("SKU 상태값이 올바르지 않습니다.");
    }

    // productId는 base_price 갱신에 필요하므로 먼저 조회
    AdminSkuRow before = skuMapper.findById(skuId);
    if (before == null) {
      throw new BusinessException("수정 대상 SKU가 없습니다.");
    }

    if (skuMapper.update(skuId, req) == 0) {
      throw new BusinessException("수정 대상 SKU가 없습니다.");
    }

    skuOptionMapper.deleteBySkuId(skuId);
    mapOptions(skuId, req.getOptionValueIds());

    // ⭐ base_price 동기화
    refreshProductBasePrice(before.getProductId());
  }

  public void delete(Long skuId) {

    AdminSkuRow before = skuMapper.findById(skuId);
    if (before == null) {
      throw new BusinessException("삭제 대상 SKU가 없습니다.");
    }

    skuOptionMapper.deleteBySkuId(skuId);

    if (skuMapper.softDelete(skuId) == 0) {
      throw new BusinessException("삭제 대상 SKU가 없습니다.");
    }

    // ⭐ base_price 동기화
    refreshProductBasePrice(before.getProductId());
  }

  private void refreshProductBasePrice(Long productId) {
    if (skuMapper.refreshProductBasePrice(productId) == 0) {
      // product가 없거나 deleted일 수도 있으니, 실패 메시지는 상황에 맞게
      throw new BusinessException("상품 대표가격(base_price) 갱신 실패");
    }
  }

  private String generateSkuCode(Long productId) {
    return "SKU-" + productId + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
  }

  private void mapOptions(Long skuId, List<Long> optionValueIds) {

    if (optionValueIds == null || optionValueIds.isEmpty()) {
      return;
    }

    for (Long optionValueId : optionValueIds) {
      int inserted = skuOptionMapper.insert(skuId, optionValueId);
      if (inserted == 0) {
        throw new BusinessException("SKU 옵션 매핑 실패");
      }
    }
  }

  private AdminSkuResponse toResponse(AdminSkuRow row) {

    AdminSkuResponse res = new AdminSkuResponse();
    res.setSkuId(row.getSkuId());
    res.setProductId(row.getProductId());
    res.setSkuCode(row.getSkuCode());
    res.setPrice(row.getPrice());
    res.setStock(row.getStock());
    res.setStatus(row.getStatus());
    return res;
  }
}
