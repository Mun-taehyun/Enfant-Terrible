package com.enfantTerrible.enfantTerrible.service.point;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.PointType;
import com.enfantTerrible.enfantTerrible.dto.point.PointBalanceResponse;
import com.enfantTerrible.enfantTerrible.dto.point.PointChangeRequest;
import com.enfantTerrible.enfantTerrible.dto.point.PointHistoryResponse;
import com.enfantTerrible.enfantTerrible.dto.point.PointHistoryRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.point.PointHistoryMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PointService {

  private final PointHistoryMapper pointHistoryMapper;

  @Transactional(readOnly = true)
  public PointBalanceResponse getMyBalance(Long userId) {
    Integer bal = pointHistoryMapper.sumBalance(userId);
    PointBalanceResponse res = new PointBalanceResponse();
    res.setUserId(userId);
    res.setBalance(bal == null ? 0 : bal);
    return res;
  }

  @Transactional(readOnly = true)
  public List<PointHistoryResponse> getMyHistory(Long userId, Integer pageParam, Integer sizeParam) {

    int page = (pageParam == null || pageParam < 1) ? 1 : pageParam;
    int size = (sizeParam == null || sizeParam < 1) ? 20 : sizeParam;
    if (size > 100) size = 100;
    int offset = (page - 1) * size;

    return pointHistoryMapper.findByUserId(userId, size, offset)
        .stream()
        .map(this::toResponse)
        .toList();
  }

  public void earn(Long userId, PointChangeRequest req) {
    pointHistoryMapper.insert(
        userId,
        req.getAmount(),
        PointType.EARN.name(),
        req.getReason(),
        req.getRefType(),
        req.getRefId()
    );
  }

  public void use(Long userId, PointChangeRequest req) {

    int balance = pointHistoryMapper.sumBalanceForUpdate(userId);
    if (balance < req.getAmount()) {
      throw new BusinessException("포인트가 부족합니다.");
    }

    pointHistoryMapper.insert(
        userId,
        -req.getAmount(),
        PointType.USE.name(),
        req.getReason(),
        req.getRefType(),
        req.getRefId()
    );
  }

  public void earnForOrderIfAbsent(Long userId, Long orderId, Long orderAmount) {
    if (userId == null || orderId == null || orderAmount == null) {
      return;
    }

    int exists = pointHistoryMapper.existsEarnForOrder(userId, orderId);
    if (exists == 1) {
      return;
    }

    int earnAmount = (int) (orderAmount / 10);
    if (earnAmount <= 0) {
      return;
    }

    pointHistoryMapper.insert(
        userId,
        earnAmount,
        PointType.EARN.name(),
        "주문 적립",
        "ORDER",
        orderId
    );
  }

  public void revokeEarnForOrderIfExists(Long userId, Long orderId, Long orderAmount) {
    if (userId == null || orderId == null || orderAmount == null) {
      return;
    }

    int earned = pointHistoryMapper.existsEarnForOrder(userId, orderId);
    if (earned != 1) {
      return;
    }

    int revoked = pointHistoryMapper.existsRevokeForOrder(userId, orderId);
    if (revoked == 1) {
      return;
    }

    int revokeAmount = (int) (orderAmount / 10);
    if (revokeAmount <= 0) {
      return;
    }

    pointHistoryMapper.insert(
        userId,
        -revokeAmount,
        PointType.ADJUST.name(),
        "주문 취소 회수",
        "ORDER",
        orderId
    );
  }

  public void adjustByAdmin(Long userId, int amount, String reason, String refType, Long refId) {
    if (userId == null) {
      throw new BusinessException("사용자 정보가 필요합니다.");
    }

    if (amount == 0) {
      throw new BusinessException("조정 포인트가 0입니다.");
    }

    // 차감(음수)일 때만 잔액 부족 방지
    if (amount < 0) {
      int balance = pointHistoryMapper.sumBalanceForUpdate(userId);
      if (balance < -amount) {
        throw new BusinessException("포인트가 부족합니다.");
      }
    }

    String finalReason = (reason == null || reason.isBlank()) ? "관리자 조정" : reason;
    String finalRefType = (refType == null || refType.isBlank()) ? "ADMIN" : refType;

    pointHistoryMapper.insert(
        userId,
        amount,
        PointType.ADJUST.name(),
        finalReason,
        finalRefType,
        refId
    );
  }

  private PointHistoryResponse toResponse(PointHistoryRow row) {
    if (row == null) {
      return null;
    }

    PointHistoryResponse res = new PointHistoryResponse();
    res.setPointHistoryId(row.getPointHistoryId());
    res.setPointAmount(row.getPointAmount());
    res.setPointType(row.getPointType());
    res.setReason(row.getReason());
    res.setRefType(row.getRefType());
    res.setRefId(row.getRefId());
    res.setCreatedAt(row.getCreatedAt());
    return res;
  }
}
