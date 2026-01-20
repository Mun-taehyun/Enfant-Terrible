package com.enfantTerrible.enfantTerrible.service.admin.product;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.SkuStatus;
import com.enfantTerrible.enfantTerrible.dto.admin.product.*;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.admin.product.*;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminProductOptionService {

  private final AdminProductOptionGroupMapper groupMapper;
  private final AdminProductOptionValueMapper valueMapper;

  private final AdminProductMapper productMapper;
  private final AdminProductSkuMapper skuMapper;
  private final AdminProductSkuOptionMapper skuOptionMapper;

  /* =======================
     Option Group
     ======================= */

  public List<AdminProductOptionGroupResponse> getGroups(Long productId) {

    return groupMapper.findByProductId(productId).stream()
        .map(this::toGroupResponse)
        .toList();
  }

  public void createGroup(AdminProductOptionGroupSaveRequest req) {
    if (groupMapper.insert(req) == 0) {
      throw new BusinessException("옵션 그룹 생성 실패");
    }

    // 옵션 구조 변경 → SKU 동기화
    syncSkus(req.getProductId());
  }

  public void updateGroup(Long groupId, AdminProductOptionGroupSaveRequest req) {
    AdminProductOptionGroupRow group = groupMapper.findById(groupId);
    if (group == null) {
      throw new BusinessException("수정할 옵션 그룹이 없습니다.");
    }

    if (groupMapper.update(groupId, req) == 0) {
      throw new BusinessException("수정할 옵션 그룹이 없습니다.");
    }

    // 옵션 구조 변경 → SKU 동기화
    syncSkus(group.getProductId());
  }

  public void deleteGroup(Long groupId) {
    AdminProductOptionGroupRow group = groupMapper.findById(groupId);
    if (group == null) {
      throw new BusinessException("삭제할 옵션 그룹이 없습니다.");
    }

    if (groupMapper.softDelete(groupId) == 0) {
      throw new BusinessException("삭제할 옵션 그룹이 없습니다.");
    }

    // 옵션 구조 변경 → SKU 동기화
    syncSkus(group.getProductId());
  }

  /* =======================
     Option Value
     ======================= */

  public List<AdminProductOptionValueResponse> getValues(Long groupId) {

    return valueMapper.findByGroupId(groupId).stream()
        .map(this::toValueResponse)
        .toList();
  }

  public void createValue(AdminProductOptionValueSaveRequest req) {
    if (valueMapper.insert(req) == 0) {
      throw new BusinessException("옵션 값 생성 실패");
    }

    AdminProductOptionGroupRow group = groupMapper.findById(req.getOptionGroupId());
    if (group == null) {
      throw new BusinessException("옵션 그룹을 찾을 수 없습니다.");
    }

    // 옵션 구조 변경 → SKU 동기화
    syncSkus(group.getProductId());
  }

  public void updateValue(Long valueId, AdminProductOptionValueSaveRequest req) {
    AdminProductOptionValueRow before = valueMapper.findById(valueId);
    if (before == null) {
      throw new BusinessException("수정할 옵션 값이 없습니다.");
    }

    if (req == null || req.getOptionGroupId() == null) {
      throw new BusinessException("옵션 그룹 정보가 필요합니다.");
    }

    // 옵션값의 그룹 이동은 SKU 조합/무결성에 영향이 크므로 허용하지 않음
    if (!before.getOptionGroupId().equals(req.getOptionGroupId())) {
      throw new BusinessException("옵션 값의 옵션 그룹 변경은 허용되지 않습니다.");
    }

    if (valueMapper.update(valueId, req) == 0) {
      throw new BusinessException("수정할 옵션 값이 없습니다.");
    }
  }

  public void deleteValue(Long valueId) {
    AdminProductOptionValueRow val = valueMapper.findById(valueId);
    if (val == null) {
      throw new BusinessException("삭제할 옵션 값이 없습니다.");
    }

    if (valueMapper.softDelete(valueId) == 0) {
      throw new BusinessException("삭제할 옵션 값이 없습니다.");
    }

    AdminProductOptionGroupRow group = groupMapper.findById(val.getOptionGroupId());
    if (group == null) {
      throw new BusinessException("옵션 그룹을 찾을 수 없습니다.");
    }

    // 옵션 구조 변경 → SKU 동기화
    syncSkus(group.getProductId());
  }

  private void syncSkus(Long productId) {
    if (productId == null) {
      return;
    }

    AdminProductRow product = productMapper.findById(productId);
    if (product == null) {
      throw new BusinessException("상품을 찾을 수 없습니다.");
    }

    List<AdminProductOptionGroupRow> groups = groupMapper.findByProductId(productId);
    if (groups == null || groups.isEmpty()) {
      // 옵션 그룹이 없으면 유효한 SKU 조합이 없다고 보고, 기존 SKU를 정리
      cleanupAllSkus(productId);
      skuMapper.refreshProductBasePrice(productId);
      return;
    }

    // 그룹별 옵션값 수집
    List<List<Long>> groupValues = new ArrayList<>();
    for (AdminProductOptionGroupRow g : groups) {
      List<Long> ids = valueMapper.findByGroupId(g.getOptionGroupId())
          .stream()
          .map(AdminProductOptionValueRow::getOptionValueId)
          .toList();
      if (ids.isEmpty()) {
        // 어떤 그룹이라도 값이 없으면 조합을 만들 수 없으므로 기존 SKU 정리
        cleanupAllSkus(productId);
        skuMapper.refreshProductBasePrice(productId);
        return;
      }
      groupValues.add(ids);
    }

    // 전체 조합 생성(옵션값 ID는 오름차순으로 정렬된 키로 사용)
    Set<String> requiredKeys = new HashSet<>();
    buildKeys(groupValues, 0, new ArrayList<>(), requiredKeys);

    // 기존 SKU 조합 키 수집
    List<Long> skuIds = skuMapper.findSkuIdsByProductId(productId);
    Set<String> existingKeys = new HashSet<>();
    java.util.Map<String, Long> keyToSkuId = new java.util.HashMap<>();

    for (Long skuId : skuIds) {
      List<Long> optionIds = skuOptionMapper.findOptionValueIdsBySkuId(skuId);
      if (optionIds == null || optionIds.isEmpty()) {
        continue;
      }
      List<Long> sorted = optionIds.stream().sorted().toList();
      String key = toKey(sorted);
      existingKeys.add(key);
      keyToSkuId.put(key, skuId);
    }

    // 1) 필요한데 없는 SKU 생성
    for (String key : requiredKeys) {
      if (existingKeys.contains(key)) {
        continue;
      }

      String skuCode = "SKU-" + productId + "-" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 12);
      AdminSkuSaveInternalRequest internal = new AdminSkuSaveInternalRequest(
          productId,
          skuCode,
          product.getBasePrice(),
          0L,
          SkuStatus.STOPPED.name()
      );

      if (skuMapper.insertInternal(internal) == 0 || internal.getSkuId() == null) {
        throw new BusinessException("SKU 자동 생성에 실패했습니다.");
      }

      List<Long> optionIds = parseKey(key);
      for (Long optionValueId : optionIds) {
        if (skuOptionMapper.insert(internal.getSkuId(), optionValueId) == 0) {
          throw new BusinessException("SKU 옵션 매핑 실패");
        }
      }
    }

    // 2) 더 이상 필요 없는 SKU는 soft delete
    for (String key : existingKeys) {
      if (requiredKeys.contains(key)) {
        continue;
      }

      Long skuId = keyToSkuId.get(key);
      if (skuId == null) {
        continue;
      }

      skuOptionMapper.deleteBySkuId(skuId);
      skuMapper.softDelete(skuId);
    }

    // base_price 동기화 (min(sku.price))
    skuMapper.refreshProductBasePrice(productId);
  }

  private void cleanupAllSkus(Long productId) {
    List<Long> skuIds = skuMapper.findSkuIdsByProductId(productId);
    for (Long skuId : skuIds) {
      skuOptionMapper.deleteBySkuId(skuId);
      skuMapper.softDelete(skuId);
    }
  }

  private void buildKeys(List<List<Long>> groupValues, int idx, List<Long> acc, Set<String> out) {
    if (idx == groupValues.size()) {
      List<Long> sorted = acc.stream().sorted().toList();
      out.add(toKey(sorted));
      return;
    }

    for (Long v : groupValues.get(idx)) {
      List<Long> next = new ArrayList<>(acc);
      next.add(v);
      buildKeys(groupValues, idx + 1, next, out);
    }
  }

  private String toKey(List<Long> optionValueIds) {
    return optionValueIds.stream().sorted().map(String::valueOf).collect(java.util.stream.Collectors.joining(","));
  }

  private List<Long> parseKey(String key) {
    if (key == null || key.isBlank()) {
      return java.util.List.of();
    }
    String[] parts = key.split(",");
    List<Long> list = new ArrayList<>();
    for (String p : parts) {
      if (p == null || p.isBlank()) continue;
      list.add(Long.valueOf(p.trim()));
    }
    return list;
  }

  /* =======================
     Mapper → Response
     ======================= */

  private AdminProductOptionGroupResponse toGroupResponse(AdminProductOptionGroupRow row) {
    AdminProductOptionGroupResponse res = new AdminProductOptionGroupResponse();
    res.setOptionGroupId(row.getOptionGroupId());
    res.setProductId(row.getProductId());
    res.setName(row.getName());
    res.setSortOrder(row.getSortOrder());
    return res;
  }

  private AdminProductOptionValueResponse toValueResponse(AdminProductOptionValueRow row) {
    AdminProductOptionValueResponse res = new AdminProductOptionValueResponse();
    res.setOptionValueId(row.getOptionValueId());
    res.setOptionGroupId(row.getOptionGroupId());
    res.setValue(row.getValue());
    res.setSortOrder(row.getSortOrder());
    return res;
  }
}
