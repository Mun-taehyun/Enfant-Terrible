package com.enfantTerrible.enfantTerrible.service.admin.discount;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.dto.admin.discount.AdminProductDiscountResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.discount.AdminProductDiscountSaveRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminProductRow;
import com.enfantTerrible.enfantTerrible.dto.product.ProductDiscountRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.admin.product.AdminProductMapper;
import com.enfantTerrible.enfantTerrible.mapper.product.ProductDiscountMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminProductDiscountService {

  private final ProductDiscountMapper productDiscountMapper;
  private final AdminProductMapper adminProductMapper;

  @Transactional(readOnly = true)
  public List<AdminProductDiscountResponse> listByProductId(Long productId) {
    AdminProductRow product = adminProductMapper.findById(productId);
    if (product == null) {
      throw new BusinessException("상품이 존재하지 않습니다.");
    }

    List<ProductDiscountRow> rows = productDiscountMapper.findByProductId(productId);
    List<AdminProductDiscountResponse> list = new ArrayList<>();
    for (ProductDiscountRow r : rows) {
      list.add(toResponse(r));
    }
    return list;
  }

  public Long create(AdminProductDiscountSaveRequest req) {
    validateRequest(req);

    AdminProductRow product = adminProductMapper.findById(req.getProductId());
    if (product == null) {
      throw new BusinessException("상품이 존재하지 않습니다.");
    }

    int inserted = productDiscountMapper.insert(
        req.getProductId(),
        req.getDiscountValue(),
        req.getDiscountType(),
        req.getStartAt(),
        req.getEndAt()
    );

    if (inserted != 1) {
      throw new BusinessException("할인 등록에 실패했습니다.");
    }

    return productDiscountMapper.findLastInsertId();
  }

  public void update(Long discountId, AdminProductDiscountSaveRequest req) {
    validateRequest(req);

    ProductDiscountRow before = productDiscountMapper.findById(discountId);
    if (before == null) {
      throw new BusinessException("수정 대상 할인이 없습니다.");
    }

    if (!before.getProductId().equals(req.getProductId())) {
      throw new BusinessException("productId가 일치하지 않습니다.");
    }

    int updated = productDiscountMapper.update(
        discountId,
        req.getDiscountValue(),
        req.getDiscountType(),
        req.getStartAt(),
        req.getEndAt()
    );

    if (updated != 1) {
      throw new BusinessException("수정 대상 할인이 없습니다.");
    }
  }

  public void delete(Long discountId) {
    ProductDiscountRow before = productDiscountMapper.findById(discountId);
    if (before == null) {
      throw new BusinessException("삭제 대상 할인이 없습니다.");
    }

    int deleted = productDiscountMapper.delete(discountId);
    if (deleted != 1) {
      throw new BusinessException("삭제 대상 할인이 없습니다.");
    }
  }

  private void validateRequest(AdminProductDiscountSaveRequest req) {
    if (req.getDiscountValue() == null) {
      throw new BusinessException("discountValue가 필요합니다.");
    }
    if (req.getDiscountType() == null || req.getDiscountType().isBlank()) {
      throw new BusinessException("discountType가 필요합니다.");
    }

    if (!req.getDiscountType().equals("rate") && !req.getDiscountType().equals("amount")) {
      throw new BusinessException("discountType은 rate/amount만 가능합니다.");
    }

    if (req.getDiscountValue() < 0) {
      throw new BusinessException("discountValue는 0 이상이어야 합니다.");
    }

    if (req.getStartAt() != null && req.getEndAt() != null && req.getEndAt().isBefore(req.getStartAt())) {
      throw new BusinessException("endAt은 startAt 이후여야 합니다.");
    }
  }

  private AdminProductDiscountResponse toResponse(ProductDiscountRow r) {
    AdminProductDiscountResponse res = new AdminProductDiscountResponse();
    res.setDiscountId(r.getDiscountId());
    res.setProductId(r.getProductId());
    res.setDiscountType(r.getDiscountType());
    res.setDiscountValue(r.getDiscountValue());
    res.setStartAt(r.getStartAt());
    res.setEndAt(r.getEndAt());
    res.setCreatedAt(r.getCreatedAt());
    return res;
  }
}
