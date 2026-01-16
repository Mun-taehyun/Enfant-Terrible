package com.enfantTerrible.enfantTerrible.service.admin.product;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
  }

  public void updateGroup(Long groupId, AdminProductOptionGroupSaveRequest req) {
    if (groupMapper.update(groupId, req) == 0) {
      throw new BusinessException("수정할 옵션 그룹이 없습니다.");
    }
  }

  public void deleteGroup(Long groupId) {
    if (groupMapper.softDelete(groupId) == 0) {
      throw new BusinessException("삭제할 옵션 그룹이 없습니다.");
    }
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
  }

  public void updateValue(Long valueId, AdminProductOptionValueSaveRequest req) {
    if (valueMapper.update(valueId, req) == 0) {
      throw new BusinessException("수정할 옵션 값이 없습니다.");
    }
  }

  public void deleteValue(Long valueId) {
    if (valueMapper.softDelete(valueId) == 0) {
      throw new BusinessException("삭제할 옵션 값이 없습니다.");
    }
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
