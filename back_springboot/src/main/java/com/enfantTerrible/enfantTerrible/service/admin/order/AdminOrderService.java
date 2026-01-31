package com.enfantTerrible.enfantTerrible.service.admin.order;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.OrderStatus;
import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.common.enums.PaymentStatus;
import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderItemCancelRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderItemCancelResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderItemResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.order.AdminOrderListResponse;
import com.enfantTerrible.enfantTerrible.dto.order.OrderItemRow;
import com.enfantTerrible.enfantTerrible.dto.order.OrderRow;
import com.enfantTerrible.enfantTerrible.dto.payment.PaymentRow;
import com.enfantTerrible.enfantTerrible.mapper.order.OrderMapper;
import com.enfantTerrible.enfantTerrible.mapper.order.OrderItemMapper;
import com.enfantTerrible.enfantTerrible.mapper.order.StockMapper;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.payment.PaymentMapper;
import com.enfantTerrible.enfantTerrible.mapper.admin.order.AdminOrderMapper;
import com.enfantTerrible.enfantTerrible.service.payment.PortOneClient;
import com.enfantTerrible.enfantTerrible.service.point.PointService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminOrderService {

  private final AdminOrderMapper adminOrderMapper;
  private final OrderMapper orderMapper;
  private final OrderItemMapper orderItemMapper;
  private final StockMapper stockMapper;
  private final PaymentMapper paymentMapper;
  private final PortOneClient portOneClient;
  private final PointService pointService;

  @Transactional(readOnly = true)
  public AdminPageResponse<AdminOrderListResponse> getOrders(AdminOrderListRequest req) {
    normalizePaging(req);

    int total = adminOrderMapper.countOrders(req);
    List<AdminOrderListResponse> list = adminOrderMapper.findOrders(req);

    return new AdminPageResponse<>(
        req.getPage(),
        req.getSize(),
        total,
        list
    );
  }

  @Transactional(readOnly = true)
  public AdminOrderDetailResponse getOrderDetail(Long orderId) {

    AdminOrderDetailResponse order = adminOrderMapper.findOrderDetail(orderId);
    if (order == null) {
      throw new BusinessException("주문을 찾을 수 없습니다.");
    }

    List<AdminOrderItemResponse> items = adminOrderMapper.findOrderItems(orderId);
    order.setItems(items);
    return order;
  }

  @Transactional
  public void updateOrderStatus(Long orderId, String status) {

    OrderStatus s;
    try {
      s = OrderStatus.from(status);
    } catch (Exception e) {
      throw new BusinessException("주문 상태 값이 올바르지 않습니다.");
    }

    AdminOrderDetailResponse order = adminOrderMapper.findOrderDetail(orderId);
    if (order == null) {
      throw new BusinessException("주문을 찾을 수 없습니다.");
    }

    if (s == OrderStatus.CANCELLED) {
      cancelOrderFully(orderId, "관리자 주문 취소");
      return;
    }

    int updated = adminOrderMapper.updateOrderStatus(orderId, s.name());
    if (updated != 1) {
      throw new BusinessException("주문 상태 변경에 실패했습니다.");
    }
  }

  private void cancelOrderFully(Long orderId, String reason) {

    OrderRow order = orderMapper.findByIdForPayment(orderId);
    if (order == null) {
      throw new BusinessException("주문을 찾을 수 없습니다.");
    }

    if (order.getOrderStatus() == null) {
      throw new BusinessException("주문 상태 값이 올바르지 않습니다.");
    }

    // 배송중/배송완료 상태에서는 취소 불가
    if (order.getOrderStatus() == OrderStatus.SHIPPING || order.getOrderStatus() == OrderStatus.DELIVERED) {
      throw new BusinessException("배송중 또는 배송완료된 주문은 취소할 수 없습니다.");
    }

    if (order.getOrderStatus() == OrderStatus.CANCELLED) {
      throw new BusinessException("이미 취소된 주문입니다.");
    }

    List<OrderItemRow> items = orderItemMapper.findByOrderId(orderId);
    if (items == null || items.isEmpty()) {
      throw new BusinessException("주문 상품이 없습니다.");
    }

    long refundAmount = 0L;
    for (OrderItemRow it : items) {
      int qty = it.getQuantity() == null ? 0 : it.getQuantity();
      int cancelled = it.getCancelledQuantity() == null ? 0 : it.getCancelledQuantity();
      int remaining = qty - cancelled;
      if (remaining <= 0) {
        continue;
      }
      long price = it.getPrice() == null ? 0L : it.getPrice();
      refundAmount += price * remaining;
    }

    if (refundAmount <= 0) {
      throw new BusinessException("환불 금액이 0입니다.");
    }

    long originalAmount = order.getOriginalAmount() == null ? 0L : order.getOriginalAmount();
    int usedPoint = order.getUsedPoint() == null ? 0 : order.getUsedPoint();
    int alreadyRefundedPoint = order.getUsedPointRefunded() == null ? 0 : order.getUsedPointRefunded();
    int maxRefundablePoint = Math.max(0, usedPoint - alreadyRefundedPoint);

    int refundPoint = 0;
    if (originalAmount > 0 && maxRefundablePoint > 0) {
      long shouldRefundTotal = (refundAmount * usedPoint) / originalAmount;
      if (shouldRefundTotal > Integer.MAX_VALUE) {
        shouldRefundTotal = Integer.MAX_VALUE;
      }
      refundPoint = (int) Math.min(maxRefundablePoint, Math.max(0L, shouldRefundTotal));
    }

    long refundCashAmount = refundAmount - refundPoint;
    if (refundCashAmount < 0) {
      refundCashAmount = 0;
    }

    PaymentRow paid = paymentMapper.findLatestSuccessByOrderId(orderId);
    if (paid != null && paid.getPgTid() != null && !paid.getPgTid().isBlank()) {
      portOneClient.cancelPayment(paid.getPgTid(), refundCashAmount, reason);

      PaymentRow refundRow = new PaymentRow();
      refundRow.setOrderId(orderId);
      refundRow.setPaymentMethod(paid.getPaymentMethod());
      refundRow.setPaymentAmount(refundCashAmount);
      refundRow.setPaymentStatus(PaymentStatus.REFUND);
      refundRow.setPgTid(paid.getPgTid());
      refundRow.setPaidAt(paid.getPaidAt());
      paymentMapper.insert(refundRow);
    }

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

    if (refundPoint > 0 && order.getUserId() != null) {
      pointService.refundUsedForOrder(order.getUserId(), orderId, refundPoint, "주문 취소 포인트 반환");
    }

    if (order.getUserId() != null) {
      pointService.revokeEarnForOrderIfExists(order.getUserId(), orderId, refundCashAmount);
    }
  }

  @Transactional
  public void startShipping(Long orderId, String trackingNumber) {

    if (trackingNumber == null || trackingNumber.isBlank()) {
      throw new BusinessException("운송장 번호가 필요합니다.");
    }

    AdminOrderDetailResponse order = adminOrderMapper.findOrderDetail(orderId);
    if (order == null) {
      throw new BusinessException("주문을 찾을 수 없습니다.");
    }

    String status = order.getStatus();
    if (status == null || status.isBlank()) {
      throw new BusinessException("주문 상태 값이 올바르지 않습니다.");
    }

    // 결제 완료(또는 부분취소 후 남은 주문)만 배송 시작 가능
    if (!OrderStatus.PAID.name().equals(status) && !OrderStatus.PARTIALLY_CANCELLED.name().equals(status)) {
      throw new BusinessException("배송 시작할 수 없는 주문 상태입니다.");
    }

    int updated = orderMapper.startShipping(
        orderId,
        trackingNumber,
        LocalDateTime.now(),
        OrderStatus.SHIPPING.name()
    );

    if (updated != 1) {
      throw new BusinessException("배송 시작 처리에 실패했습니다.");
    }
  }

  @Transactional
  public AdminOrderItemCancelResponse cancelItems(Long orderId, AdminOrderItemCancelRequest req) {

    if (req == null || req.getItems() == null || req.getItems().isEmpty()) {
      throw new BusinessException("취소할 상품이 없습니다.");
    }

    OrderRow order = orderMapper.findByIdForPayment(orderId);
    if (order == null) {
      throw new BusinessException("주문을 찾을 수 없습니다.");
    }

    // 배송중/배송완료 상태에서는 취소 불가
    if (order.getOrderStatus() == OrderStatus.SHIPPING || order.getOrderStatus() == OrderStatus.DELIVERED) {
      throw new BusinessException("배송중 또는 배송완료된 주문은 취소할 수 없습니다.");
    }

    if (order.getOrderStatus() != OrderStatus.PAID && order.getOrderStatus() != OrderStatus.PARTIALLY_CANCELLED) {
      throw new BusinessException("부분취소할 수 없는 주문 상태입니다.");
    }

    PaymentRow paid = paymentMapper.findLatestSuccessByOrderId(orderId);
    if (paid == null || paid.getPgTid() == null || paid.getPgTid().isBlank()) {
      throw new BusinessException("결제 정보를 찾을 수 없습니다.");
    }

    // 주문 아이템 스냅샷
    List<OrderItemRow> orderItems = orderItemMapper.findByOrderId(orderId);
    if (orderItems == null || orderItems.isEmpty()) {
      throw new BusinessException("주문 상품이 없습니다.");
    }

    Map<Long, OrderItemRow> itemMap = new HashMap<>();
    for (OrderItemRow r : orderItems) {
      itemMap.put(r.getSkuId(), r);
    }

    // 요청 중복 SKU 방지
    Map<Long, Integer> cancelQtyMap = new HashMap<>();
    for (var it : req.getItems()) {
      Long skuId = it.getSkuId();
      Integer qty = it.getQuantity();
      if (skuId == null || qty == null) {
        continue;
      }
      int prev = cancelQtyMap.getOrDefault(skuId, 0);
      cancelQtyMap.put(skuId, prev + qty);
    }

    long refundAmount = 0L;

    // 취소 수량 검증 + 금액 산정
    for (Map.Entry<Long, Integer> e : cancelQtyMap.entrySet()) {
      Long skuId = e.getKey();
      Integer cancelQty = e.getValue();

      if (cancelQty == null || cancelQty < 1) {
        throw new BusinessException("취소 수량이 올바르지 않습니다.");
      }

      OrderItemRow row = itemMap.get(skuId);
      if (row == null) {
        throw new BusinessException("주문에 없는 SKU가 포함되어 있습니다.");
      }

      int cancelled = row.getCancelledQuantity() == null ? 0 : row.getCancelledQuantity();
      int remaining = (row.getQuantity() == null ? 0 : row.getQuantity()) - cancelled;
      if (remaining < cancelQty) {
        throw new BusinessException("취소 수량이 남은 수량을 초과합니다.");
      }

      if (row.getPrice() == null || row.getPrice() < 0) {
        throw new BusinessException("상품 가격이 올바르지 않습니다.");
      }

      refundAmount += row.getPrice() * cancelQty;
    }

    if (refundAmount <= 0) {
      throw new BusinessException("환불 금액이 0입니다.");
    }

    long originalAmount = order.getOriginalAmount() == null ? 0L : order.getOriginalAmount();
    int usedPoint = order.getUsedPoint() == null ? 0 : order.getUsedPoint();
    int alreadyRefundedPoint = order.getUsedPointRefunded() == null ? 0 : order.getUsedPointRefunded();
    int maxRefundablePoint = Math.max(0, usedPoint - alreadyRefundedPoint);

    int refundPoint = 0;
    if (originalAmount > 0 && maxRefundablePoint > 0) {
      long shouldRefundTotal = (refundAmount * usedPoint) / originalAmount;
      if (shouldRefundTotal > Integer.MAX_VALUE) {
        shouldRefundTotal = Integer.MAX_VALUE;
      }
      refundPoint = (int) Math.min(maxRefundablePoint, Math.max(0L, shouldRefundTotal));
    }

    long refundCashAmount = refundAmount - refundPoint;
    if (refundCashAmount < 0) {
      refundCashAmount = 0;
    }

    // 1) 주문 아이템 취소 수량 누적 + 2) 재고 복구
    for (Map.Entry<Long, Integer> e : cancelQtyMap.entrySet()) {
      Long skuId = e.getKey();
      Integer cancelQty = e.getValue();

      int updated = orderItemMapper.increaseCancelledQuantity(orderId, skuId, cancelQty);
      if (updated != 1) {
        throw new BusinessException("주문 아이템 취소 처리에 실패했습니다.");
      }

      stockMapper.increaseStock(skuId, cancelQty);
    }

    // 3) PortOne 부분취소 (현금 환불액)
    portOneClient.cancelPayment(paid.getPgTid(), refundCashAmount, req.getReason());

    // 4) 환불 결제 이력 기록 (누적 환불용)
    PaymentRow refundRow = new PaymentRow();
    refundRow.setOrderId(orderId);
    refundRow.setPaymentMethod(paid.getPaymentMethod());
    refundRow.setPaymentAmount(refundCashAmount);
    refundRow.setPaymentStatus(PaymentStatus.REFUND);
    refundRow.setPgTid(paid.getPgTid());
    refundRow.setPaidAt(paid.getPaidAt());
    paymentMapper.insert(refundRow);

    // 5) 주문 잔액/상태 갱신 (남은 현금 결제금액)
    Long cancelledAmount = orderItemMapper.sumCancelledAmount(orderId);
    long remCash = (order.getTotalAmount() == null ? 0L : order.getTotalAmount()) - refundCashAmount;
    if (remCash < 0) {
      remCash = 0;
    }

    OrderStatus nextStatus = remCash <= 0 ? OrderStatus.CANCELLED : OrderStatus.PARTIALLY_CANCELLED;

    int newRefundedPoint = alreadyRefundedPoint + refundPoint;
    int orderUpdated = orderMapper.updateStatusTotalAndUsedPointRefunded(orderId, nextStatus.name(), remCash, newRefundedPoint);
    if (orderUpdated != 1) {
      throw new BusinessException("주문 상태 갱신에 실패했습니다.");
    }

    if (refundPoint > 0) {
      pointService.refundUsedForOrder(order.getUserId(), orderId, refundPoint, "주문 부분취소 포인트 반환");
    }

    // 6) 포인트 부분 회수(환불 누적 금액 기준)
    pointService.revokeEarnForOrderPartially(order.getUserId(), orderId, cancelledAmount == null ? 0L : cancelledAmount);

    AdminOrderItemCancelResponse res = new AdminOrderItemCancelResponse();
    res.setOrderId(orderId);
    res.setOrderStatus(nextStatus.name());
    res.setRefundAmount(refundCashAmount);
    res.setRemainingAmount(remCash);
    return res;
  }

  private void normalizePaging(AdminOrderListRequest req) {
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
