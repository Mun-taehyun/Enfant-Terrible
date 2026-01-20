package com.enfantTerrible.enfantTerrible.service.admin.product;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.SkuStatus;
import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.product.*;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.admin.product.*;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminProductSkuService {

  private final AdminProductSkuMapper skuMapper;
  private final AdminProductSkuOptionMapper skuOptionMapper;

  /* =======================
     SKU 조회
     ======================= */

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


  /* =======================
     SKU 상세 조회
     ======================= */

  @Transactional(readOnly = true)
  public AdminSkuResponse getSku(Long skuId) {

    AdminSkuRow row = skuMapper.findById(skuId);
    if (row == null) {
      throw new BusinessException("SKU가 존재하지 않습니다.");
    }

    return toResponse(row);
  }
  

  /* =======================
     SKU 생성
     ======================= */

  public void create(AdminSkuSaveRequest req) {

  // 1. 상태 검증
  SkuStatus.from(req.getStatus());

  // 2. SKU 코드 생성
  String skuCode = generateSkuCode(req.getProductId());

  // 3. SKU 저장용 객체 생성
  AdminSkuSaveInternalRequest internalReq =
      new AdminSkuSaveInternalRequest(
          req.getProductId(),
          skuCode,
          req.getPrice(),
          req.getStock(),
          req.getStatus()
      );

  // 4. SKU insert
  if (skuMapper.insertInternal(internalReq) == 0) {
    throw new BusinessException("SKU 등록에 실패했습니다.");
  }

  // 5. 생성된 SKU 조회
  AdminSkuRow row = skuMapper.findBySkuCode(skuCode);
  if (row == null) {
    throw new BusinessException("SKU 생성 후 조회 실패");
  }

  // 6. 옵션 매핑
  mapOptions(row.getSkuId(), req.getOptionValueIds());
}

  /* =======================
     SKU 수정
     ======================= */

  public void update(Long skuId, AdminSkuSaveRequest req) {

    SkuStatus.from(req.getStatus());

    if (skuMapper.update(skuId, req) == 0) {
      throw new BusinessException("수정 대상 SKU가 없습니다.");
    }

    // 기존 매핑 제거 후 재등록
    skuOptionMapper.deleteBySkuId(skuId);
    mapOptions(skuId, req.getOptionValueIds());
  }

  /* =======================
     SKU 삭제
     ======================= */

  public void delete(Long skuId) {

    skuOptionMapper.deleteBySkuId(skuId);

    if (skuMapper.softDelete(skuId) == 0) {
      throw new BusinessException("삭제 대상 SKU가 없습니다.");
    }
  }

  /* =======================
     내부 로직
     ======================= */

  private String generateSkuCode(Long productId) {
    return "SKU-" + productId + "-" + System.currentTimeMillis();
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
