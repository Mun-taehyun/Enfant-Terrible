package com.enfantTerrible.enfantTerrible.service.admin.product;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.SkuStatus;
import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.product.*;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.admin.product.AdminProductSkuMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminProductSkuService {

  private final AdminProductSkuMapper skuMapper;

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

  public AdminSkuResponse getSku(Long skuId) {

    AdminSkuRow row = skuMapper.findById(skuId);
    if (row == null) {
      throw new BusinessException("SKU가 존재하지 않습니다.");
    }

    return toResponse(row);
  }

  public void create(AdminSkuSaveRequest req) {

    SkuStatus.from(req.getStatus()); // 상태 검증

    if (skuMapper.insert(req) == 0) {
      throw new BusinessException("SKU 등록에 실패했습니다.");
    }
  }

  public void update(Long skuId, AdminSkuSaveRequest req) {

    SkuStatus.from(req.getStatus());

    if (skuMapper.update(skuId, req) == 0) {
      throw new BusinessException("수정 대상 SKU가 없습니다.");
    }
  }

  public void delete(Long skuId) {

    if (skuMapper.softDelete(skuId) == 0) {
      throw new BusinessException("삭제 대상 SKU가 없습니다.");
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
