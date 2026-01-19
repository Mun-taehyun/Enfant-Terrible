package com.enfantTerrible.enfantTerrible.service.payment;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.OrderStatus;
import com.enfantTerrible.enfantTerrible.common.enums.PaymentMethod;
import com.enfantTerrible.enfantTerrible.common.enums.PaymentStatus;
import com.enfantTerrible.enfantTerrible.dto.order.OrderRow;
import com.enfantTerrible.enfantTerrible.dto.payment.PaymentCancelRequest;
import com.enfantTerrible.enfantTerrible.dto.payment.PaymentCancelResponse;
import com.enfantTerrible.enfantTerrible.dto.payment.PaymentConfirmRequest;
import com.enfantTerrible.enfantTerrible.dto.payment.PaymentConfirmResponse;
import com.enfantTerrible.enfantTerrible.dto.payment.PaymentRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.order.OrderMapper;
import com.enfantTerrible.enfantTerrible.mapper.payment.PaymentMapper;
import com.enfantTerrible.enfantTerrible.service.point.PointService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

  private final PaymentMapper paymentMapper;
  private final OrderMapper orderMapper;
  private final PortOneClient portOneClient;
  private final PointService pointService;

  public PaymentConfirmResponse confirm(Long userId, PaymentConfirmRequest req) {

    // PortOne v2의 orderId는 paymentId와 별개이므로, 우리 시스템에서는 orderCode를 그대로 받아서 검증에 사용
    OrderRow order = orderMapper.findByCodeForPayment(req.getOrderId());
    if (order == null) {
      throw new BusinessException("주문을 찾을 수 없습니다.");
    }

    if (order.getUserId() == null || !order.getUserId().equals(userId)) {
      throw new BusinessException("결제 권한이 없습니다.");
    }

    if (order.getOrderStatus() != OrderStatus.ORDERED && order.getOrderStatus() != OrderStatus.PAYMENT_PENDING) {
      throw new BusinessException("결제할 수 없는 주문 상태입니다.");
    }

    if (order.getTotalAmount() == null || !order.getTotalAmount().equals(req.getAmount())) {
      throw new BusinessException("결제 금액이 주문 금액과 일치하지 않습니다.");
    }

    // 중복 승인 방지(이미 성공 결제 존재)
    PaymentRow latest = paymentMapper.findLatestByOrderId(order.getOrderId());
    if (latest != null && latest.getPaymentStatus() == PaymentStatus.SUCCESS) {
      throw new BusinessException("이미 결제가 완료된 주문입니다.");
    }

    // 결제 진행 상태로 전환 (실패해도 주문 자체를 취소로 만들지는 않음)
    if (order.getOrderStatus() == OrderStatus.ORDERED) {
      orderMapper.updateOrderStatus(order.getOrderId(), OrderStatus.PAYMENT_PENDING.name());
    }

    // 결제 시도 스냅샷 저장(READY)
    PaymentRow payment = new PaymentRow();
    payment.setOrderId(order.getOrderId());
    payment.setPaymentMethod(PaymentMethod.TOSSPAY);
    payment.setPaymentAmount(req.getAmount());
    payment.setPaymentStatus(PaymentStatus.READY);
    payment.setPgTid(req.getPaymentId());
    payment.setPaidAt(null);

    paymentMapper.insert(payment);

    try {
      PortOnePaymentResponse portonePayment = portOneClient.getPayment(req.getPaymentId());
      if (portonePayment == null) {
        throw new BusinessException("결제 정보를 조회할 수 없습니다.");
      }

      Long paidAmount = portonePayment.getAmount() == null ? null : portonePayment.getAmount().getTotal();
      if (paidAmount == null || !paidAmount.equals(req.getAmount())) {
        throw new BusinessException("결제 금액이 주문 금액과 일치하지 않습니다.");
      }

      PaymentMethod method = mapPortOneMethod(
          portonePayment.getPaymentMethod() == null ? null : portonePayment.getPaymentMethod().getType()
      );
      PaymentStatus status = mapPortOneStatus(portonePayment.getStatus());

      LocalDateTime paidAt = parseApprovedAt(portonePayment.getPaidAt());

      payment.setPaymentMethod(method);
      payment.setPaymentStatus(status);
      payment.setPaidAt(paidAt);

      paymentMapper.updateStatus(
          payment.getPaymentId(),
          payment.getPaymentStatus().name(),
          payment.getPgTid(),
          payment.getPaidAt()
      );

      if (status == PaymentStatus.SUCCESS) {
        orderMapper.updateOrderStatus(order.getOrderId(), OrderStatus.PAID.name());
        pointService.earnForOrderIfAbsent(order.getUserId(), order.getOrderId(), order.getTotalAmount());
      }

      PaymentConfirmResponse res = new PaymentConfirmResponse();
      res.setPaymentId(payment.getPaymentId());
      res.setOrderId(order.getOrderId());
      res.setPaymentStatus(payment.getPaymentStatus());
      res.setPaymentMethod(payment.getPaymentMethod());
      res.setPaymentAmount(payment.getPaymentAmount());
      res.setPgTid(payment.getPgTid());
      res.setPaidAt(portonePayment.getPaidAt());
      return res;

    } catch (Exception e) {
      paymentMapper.updateStatus(
          payment.getPaymentId(),
          PaymentStatus.FAIL.name(),
          payment.getPgTid(),
          null
      );
      throw new BusinessException("결제 승인에 실패했습니다.", e);
    }
  }

  public PaymentCancelResponse cancel(Long userId, PaymentCancelRequest req) {

    OrderRow order = orderMapper.findByCodeForPayment(req.getOrderId());
    if (order == null) {
      throw new BusinessException("주문을 찾을 수 없습니다.");
    }

    if (order.getUserId() == null || !order.getUserId().equals(userId)) {
      throw new BusinessException("환불 권한이 없습니다.");
    }

    if (order.getOrderStatus() != OrderStatus.PAID) {
      throw new BusinessException("환불할 수 없는 주문 상태입니다.");
    }

    PaymentRow latest = paymentMapper.findLatestByOrderId(order.getOrderId());
    if (latest == null) {
      throw new BusinessException("결제 정보를 찾을 수 없습니다.");
    }

    if (latest.getPaymentStatus() != PaymentStatus.SUCCESS) {
      throw new BusinessException("환불할 수 없는 결제 상태입니다.");
    }

    if (latest.getPaymentAmount() == null || !latest.getPaymentAmount().equals(req.getAmount())) {
      throw new BusinessException("환불 금액이 결제 금액과 일치하지 않습니다.");
    }

    if (latest.getPgTid() == null || !latest.getPgTid().equals(req.getPaymentId())) {
      throw new BusinessException("결제 식별자가 올바르지 않습니다.");
    }

    try {
      PortOneCancelPaymentResponse cancelRes = portOneClient.cancelPayment(
          req.getPaymentId(),
          req.getAmount(),
          req.getReason()
      );

      paymentMapper.updateStatus(
          latest.getPaymentId(),
          PaymentStatus.REFUND.name(),
          latest.getPgTid(),
          latest.getPaidAt()
      );

      orderMapper.updateOrderStatus(order.getOrderId(), OrderStatus.CANCELLED.name());

      pointService.revokeEarnForOrderIfExists(order.getUserId(), order.getOrderId(), order.getTotalAmount());

      PaymentCancelResponse res = new PaymentCancelResponse();
      res.setPaymentId(latest.getPaymentId());
      res.setOrderId(order.getOrderId());
      res.setPaymentStatus(PaymentStatus.REFUND);
      res.setPgTid(latest.getPgTid());
      res.setCancelledAt(cancelRes == null ? null : cancelRes.getCancelledAt());
      return res;

    } catch (Exception e) {
      throw new BusinessException("환불 처리에 실패했습니다.", e);
    }
  }

  private PaymentStatus mapPortOneStatus(String status) {
    if (status == null) {
      return PaymentStatus.FAIL;
    }

    // PortOne v2: PAID, FAILED, CANCELLED, PARTIAL_CANCELLED, READY, PAY_PENDING, VIRTUAL_ACCOUNT_ISSUED ...
    switch (status.toUpperCase()) {
      case "PAID":
        return PaymentStatus.SUCCESS;
      case "CANCELLED":
      case "PARTIAL_CANCELLED":
        return PaymentStatus.REFUND;
      case "READY":
      case "PAY_PENDING":
      case "VIRTUAL_ACCOUNT_ISSUED":
        return PaymentStatus.READY;
      default:
        return PaymentStatus.FAIL;
    }
  }

  private PaymentMethod mapPortOneMethod(String methodType) {
    if (methodType == null) {
      return PaymentMethod.TOSSPAY;
    }

    String m = methodType.trim().toUpperCase();

    if (m.contains("CARD")) {
      return PaymentMethod.CARD;
    }

    if (m.contains("VIRTUAL_ACCOUNT")) {
      return PaymentMethod.VIRTUAL_ACCOUNT;
    }

    if (m.contains("TRANSFER")) {
      return PaymentMethod.TRANSFER;
    }

    if (m.contains("MOBILE")) {
      return PaymentMethod.MOBILE;
    }

    return PaymentMethod.TOSSPAY;
  }

  private LocalDateTime parseApprovedAt(String approvedAt) {
    if (approvedAt == null || approvedAt.isBlank()) {
      return null;
    }
    try {
      return OffsetDateTime.parse(approvedAt).toLocalDateTime();
    } catch (Exception e) {
      return null;
    }
  }
}
