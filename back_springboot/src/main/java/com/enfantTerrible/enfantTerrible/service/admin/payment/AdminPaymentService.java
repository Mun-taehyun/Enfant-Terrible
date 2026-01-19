package com.enfantTerrible.enfantTerrible.service.admin.payment;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.OrderStatus;
import com.enfantTerrible.enfantTerrible.common.enums.PaymentStatus;
import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.payment.AdminPaymentCancelRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.payment.AdminPaymentDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.payment.AdminPaymentListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.payment.AdminPaymentListResponse;
import com.enfantTerrible.enfantTerrible.dto.order.OrderRow;
import com.enfantTerrible.enfantTerrible.dto.payment.PaymentRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.admin.payment.AdminPaymentMapper;
import com.enfantTerrible.enfantTerrible.mapper.order.OrderMapper;
import com.enfantTerrible.enfantTerrible.mapper.payment.PaymentMapper;
import com.enfantTerrible.enfantTerrible.service.payment.PortOneCancelPaymentResponse;
import com.enfantTerrible.enfantTerrible.service.payment.PortOneClient;
import com.enfantTerrible.enfantTerrible.service.point.PointService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminPaymentService {

  private final AdminPaymentMapper adminPaymentMapper;
  private final PaymentMapper paymentMapper;
  private final OrderMapper orderMapper;
  private final PortOneClient portOneClient;
  private final PointService pointService;

  @Transactional(readOnly = true)
  public AdminPageResponse<AdminPaymentListResponse> getPayments(AdminPaymentListRequest req) {
    normalizePaging(req);

    int total = adminPaymentMapper.countPayments(req);
    List<AdminPaymentListResponse> list = adminPaymentMapper.findPayments(req);

    return new AdminPageResponse<>(
        req.getPage(),
        req.getSize(),
        total,
        list
    );
  }

  @Transactional(readOnly = true)
  public AdminPaymentDetailResponse getPayment(Long paymentId) {
    AdminPaymentDetailResponse res = adminPaymentMapper.findPaymentDetail(paymentId);
    if (res == null) {
      throw new BusinessException("결제 정보를 찾을 수 없습니다.");
    }
    return res;
  }

  @Transactional
  public void cancelPayment(Long paymentId, AdminPaymentCancelRequest req) {

    AdminPaymentDetailResponse p = adminPaymentMapper.findPaymentDetail(paymentId);
    if (p == null) {
      throw new BusinessException("결제 정보를 찾을 수 없습니다.");
    }

    if (p.getPaymentAmount() == null || !p.getPaymentAmount().equals(req.getAmount())) {
      throw new BusinessException("환불 금액이 결제 금액과 일치하지 않습니다.");
    }

    if (p.getPaymentStatus() == null || !p.getPaymentStatus().equals(PaymentStatus.SUCCESS.name())) {
      throw new BusinessException("환불할 수 없는 결제 상태입니다.");
    }

    if (p.getPgTid() == null || p.getPgTid().isBlank()) {
      throw new BusinessException("PG 결제 식별자가 없습니다.");
    }

    // 주문 상태 검증 및 조회(포인트 회수용 총액 포함)
    OrderRow order = orderMapper.findByIdForPayment(p.getOrderId());
    if (order == null) {
      throw new BusinessException("주문을 찾을 수 없습니다.");
    }

    if (order.getOrderStatus() != OrderStatus.PAID) {
      throw new BusinessException("환불할 수 없는 주문 상태입니다.");
    }

    // PortOne 결제 취소
    PortOneCancelPaymentResponse cancelRes = portOneClient.cancelPayment(
        p.getPgTid(),
        req.getAmount(),
        req.getReason()
    );

    // et_payment 상태 변경
    PaymentRow latest = paymentMapper.findLatestByOrderId(order.getOrderId());
    if (latest == null || !latest.getPaymentId().equals(paymentId)) {
      throw new BusinessException("최신 결제건만 환불할 수 있습니다.");
    }

    paymentMapper.updateStatus(
        paymentId,
        PaymentStatus.REFUND.name(),
        latest.getPgTid(),
        latest.getPaidAt()
    );

    // 주문 취소
    orderMapper.updateOrderStatus(order.getOrderId(), OrderStatus.CANCELLED.name());

    // 주문 적립 포인트 회수
    pointService.revokeEarnForOrderIfExists(order.getUserId(), order.getOrderId(), order.getTotalAmount());

    // cancelRes는 별도 반환하지 않음 (필요하면 DTO 확장)
    if (cancelRes == null) {
      // noop
    }
  }

  private void normalizePaging(AdminPaymentListRequest req) {
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
