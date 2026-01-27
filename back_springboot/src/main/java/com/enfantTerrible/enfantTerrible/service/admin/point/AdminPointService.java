package com.enfantTerrible.enfantTerrible.service.admin.point;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.point.AdminPointAdjustRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.point.AdminPointBalanceResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.point.AdminPointHistoryRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.point.AdminPointHistoryResponse;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.admin.point.AdminPointMapper;
import com.enfantTerrible.enfantTerrible.mapper.point.PointHistoryMapper;
import com.enfantTerrible.enfantTerrible.service.point.PointService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminPointService {

  private final PointHistoryMapper pointHistoryMapper;
  private final AdminPointMapper adminPointMapper;
  private final PointService pointService;

  @Transactional(readOnly = true)
  public AdminPointBalanceResponse getUserBalance(Long userId) {
    Integer bal = pointHistoryMapper.sumBalance(userId);
    AdminPointBalanceResponse res = new AdminPointBalanceResponse();
    res.setUserId(userId);
    res.setBalance(bal == null ? 0 : bal);
    return res;
  }

  @Transactional(readOnly = true)
  public AdminPageResponse<AdminPointHistoryResponse> getUserHistory(Long userId, AdminPointHistoryRequest req) {
    normalizePaging(req);

    int total = adminPointMapper.countHistory(userId);
    List<AdminPointHistoryResponse> list = adminPointMapper.findHistory(userId, req);

    return new AdminPageResponse<>(
        req.getPage(),
        req.getSize(),
        total,
        list
    );
  }

  @Transactional
  public void adjust(Long userId, AdminPointAdjustRequest req) {
    if (req == null || req.getAmount() == null) {
      throw new BusinessException("요청 값이 비어있습니다.");
    }

    pointService.adjustByAdmin(userId, req.getAmount(), req.getReason(), req.getRefType(), req.getRefId());
  }

  private void normalizePaging(AdminPointHistoryRequest req) {
    if (req == null) {
      throw new BusinessException("요청 값이 비어있습니다.");
    }

    if (req.getPage() < 1) {
      req.setPage(1);
    }

    if (req.getSize() < 1) {
      req.setSize(20);
    } else if (req.getSize() > 200) {
      req.setSize(200);
    }
  }
}
