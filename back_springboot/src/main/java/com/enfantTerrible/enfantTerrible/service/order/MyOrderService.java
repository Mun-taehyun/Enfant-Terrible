package com.enfantTerrible.enfantTerrible.service.order;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.OrderStatus;
import com.enfantTerrible.enfantTerrible.common.enums.PaymentStatus;
import com.enfantTerrible.enfantTerrible.common.response.PageResponse;
import com.enfantTerrible.enfantTerrible.dto.order.MyOrderCancelRequest;
import com.enfantTerrible.enfantTerrible.dto.order.MyOrderCancelResponse;
import com.enfantTerrible.enfantTerrible.dto.order.MyOrderDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.order.MyOrderDetailRow;
import com.enfantTerrible.enfantTerrible.dto.order.MyOrderItemResponse;
import com.enfantTerrible.enfantTerrible.dto.order.MyOrderListItemResponse;
import com.enfantTerrible.enfantTerrible.dto.order.OrderItemRow;
import com.enfantTerrible.enfantTerrible.dto.order.OrderRow;
import com.enfantTerrible.enfantTerrible.dto.payment.PaymentRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.order.OrderItemMapper;
import com.enfantTerrible.enfantTerrible.mapper.order.OrderMapper;
import com.enfantTerrible.enfantTerrible.mapper.order.StockMapper;
import com.enfantTerrible.enfantTerrible.mapper.payment.PaymentMapper;
import com.enfantTerrible.enfantTerrible.service.payment.PortOneClient;
import com.enfantTerrible.enfantTerrible.service.point.PointService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MyOrderService {

  private final OrderMapper orderMapper;
  private final OrderItemMapper orderItemMapper;
  private final PaymentMapper paymentMapper;
  private final StockMapper stockMapper;
  private final PortOneClient portOneClient;
  private final PointService pointService;

  @Transactional(readOnly = true)
  public PageResponse<MyOrderListItemResponse> getMyOrders(Long userId, Integer pageParam, Integer sizeParam) {

    int page = (pageParam == null || pageParam < 1) ? 1 : pageParam;
    int size = (sizeParam == null || sizeParam < 1) ? 20 : sizeParam;
    if (size > 100) size = 100;

    int offset = (page - 1) * size;

    int totalCount = orderMapper.countMyOrders(userId);
    List<MyOrderListItemResponse> items = orderMapper.findMyOrders(userId, size, offset);

    return new PageResponse<>(page, size, totalCount, items);
  }

  @Transactional(readOnly = true)
  public MyOrderDetailResponse getMyOrderDetail(Long userId, Long orderId) {

    MyOrderDetailRow row = orderMapper.findMyOrderDetail(userId, orderId);
    if (row == null) {
      throw new BusinessException("주문을 찾을 수 없습니다.");
    }

    List<OrderItemRow> itemRows = orderItemMapper.findByOrderId(orderId);

    MyOrderDetailResponse res = new MyOrderDetailResponse();
    res.setOrderId(row.getOrderId());
    res.setOrderCode(row.getOrderCode());
    res.setStatus(row.getOrderStatus() == null ? null : row.getOrderStatus().name());
    res.setTotalAmount(row.getTotalAmount());

    res.setReceiverName(row.getReceiverName());
    res.setReceiverPhone(row.getReceiverPhone());
    res.setZipCode(row.getZipCode());
    res.setAddressBase(row.getAddressBase());
    res.setAddressDetail(row.getAddressDetail());

    res.setTrackingNumber(row.getTrackingNumber());
    res.setOrderedAt(row.getOrderedAt());
    res.setShippedAt(row.getShippedAt());
    res.setDeliveredAt(row.getDeliveredAt());

    res.setItems(itemRows.stream().map(r -> {
      MyOrderItemResponse it = new MyOrderItemResponse();
      it.setSkuId(r.getSkuId());
      it.setProductName(r.getProductName());
      it.setPrice(r.getPrice());
      it.setQuantity(r.getQuantity());
      it.setCancelledQuantity(r.getCancelledQuantity());

      int qty = r.getQuantity() == null ? 0 : r.getQuantity();
      int cancelled = r.getCancelledQuantity() == null ? 0 : r.getCancelledQuantity();
      it.setRemainingQuantity(qty - cancelled);
      return it;
    }).toList());

    return res;
  }

  public MyOrderCancelResponse cancelMyOrder(Long userId, Long orderId, MyOrderCancelRequest req) {

    if (orderId == null) {
      throw new BusinessException("orderId가 필요합니다.");
    }

    OrderRow order = orderMapper.findByIdForPayment(orderId);
    if (order == null || order.getUserId() == null || !order.getUserId().equals(userId)) {
      throw new BusinessException("주문을 찾을 수 없습니다.");
    }

    OrderStatus status = order.getOrderStatus();
    if (status == null) {
      throw new BusinessException("주문 상태가 올바르지 않습니다.");
    }

    // 배송 시작 이후(출고 후) 취소 불가
    MyOrderDetailRow detail = orderMapper.findMyOrderDetail(userId, orderId);
    if (detail != null && (detail.getShippedAt() != null || status == OrderStatus.SHIPPING || status == OrderStatus.DELIVERED)) {
      throw new BusinessException("배송중 또는 배송완료된 주문은 취소할 수 없습니다.");
    }

    // 이미 취소 상태
    if (status == OrderStatus.CANCELLED) {
      throw new BusinessException("이미 취소된 주문입니다.");
    }

    // 취소 대상 아이템
    List<OrderItemRow> items = orderItemMapper.findByOrderId(orderId);
    if (items == null || items.isEmpty()) {
      throw new BusinessException("주문 상품이 없습니다.");
    }

    long cancelledOriginalAmount = 0L;
    for (OrderItemRow it : items) {
      int qty = it.getQuantity() == null ? 0 : it.getQuantity();
      int cancelled = it.getCancelledQuantity() == null ? 0 : it.getCancelledQuantity();
      int remaining = qty - cancelled;
      if (remaining <= 0) {
        continue;
      }
      long price = it.getPrice() == null ? 0L : it.getPrice();
      cancelledOriginalAmount += price * remaining;
    }

    if (cancelledOriginalAmount <= 0) {
      throw new BusinessException("환불 금액이 0입니다.");
    }

    long originalAmount = order.getOriginalAmount() == null ? 0L : order.getOriginalAmount();
    int usedPoint = order.getUsedPoint() == null ? 0 : order.getUsedPoint();
    int alreadyRefundedPoint = order.getUsedPointRefunded() == null ? 0 : order.getUsedPointRefunded();
    int maxRefundablePoint = Math.max(0, usedPoint - alreadyRefundedPoint);

    int refundPoint = 0;
    if (originalAmount > 0 && maxRefundablePoint > 0) {
      long shouldRefundTotal = (cancelledOriginalAmount * usedPoint) / originalAmount;
      if (shouldRefundTotal > Integer.MAX_VALUE) {
        shouldRefundTotal = Integer.MAX_VALUE;
      }
      refundPoint = (int) Math.min(maxRefundablePoint, Math.max(0L, shouldRefundTotal));
    }

    long refundCashAmount = cancelledOriginalAmount - refundPoint;
    if (refundCashAmount < 0) {
      refundCashAmount = 0;
    }

    // 결제 성공 이력이 있으면 PG 취소 수행 (현금 환불액)
    PaymentRow paid = paymentMapper.findLatestSuccessByOrderId(orderId);
    if (paid != null && paid.getPgTid() != null && !paid.getPgTid().isBlank()) {
      portOneClient.cancelPayment(paid.getPgTid(), refundCashAmount, req == null ? null : req.getReason());

      PaymentRow refundRow = new PaymentRow();
      refundRow.setOrderId(orderId);
      refundRow.setPaymentMethod(paid.getPaymentMethod());
      refundRow.setPaymentAmount(refundCashAmount);
      refundRow.setPaymentStatus(PaymentStatus.REFUND);
      refundRow.setPgTid(paid.getPgTid());
      refundRow.setPaidAt(paid.getPaidAt());
      paymentMapper.insert(refundRow);
    }

    // 아이템 cancelled_quantity 누적 + 재고 복구
    for (OrderItemRow it : items) {
      int qty = it.getQuantity() == null ? 0 : it.getQuantity();
      int cancelled = it.getCancelledQuantity() == null ? 0 : it.getCancelledQuantity();
      int remaining = qty - cancelled;
      if (remaining <= 0) {
        continue;
      }

      int updated = orderItemMapper.increaseCancelledQuantity(orderId, it.getSkuId(), remaining);
      if (updated != 1) {
        throw new BusinessException("주문 취소 처리에 실패했습니다.");
      }

      stockMapper.increaseStock(it.getSkuId(), remaining);
    }

    int newRefundedPoint = alreadyRefundedPoint + refundPoint;
    int orderUpdated = orderMapper.updateStatusTotalAndUsedPointRefunded(orderId, OrderStatus.CANCELLED.name(), 0L, newRefundedPoint);
    if (orderUpdated != 1) {
      throw new BusinessException("주문 상태 갱신에 실패했습니다.");
    }

    if (refundPoint > 0) {
      pointService.refundUsedForOrder(userId, orderId, refundPoint, "주문 취소 포인트 반환");
    }

    // 포인트 회수(적립분)
    pointService.revokeEarnForOrderIfExists(userId, orderId, refundCashAmount);

    MyOrderCancelResponse res = new MyOrderCancelResponse();
    res.setOrderId(orderId);
    res.setOrderStatus(OrderStatus.CANCELLED.name());
    res.setRefundAmount(refundCashAmount);
    res.setRemainingAmount(0L);
    return res;
  }
}
