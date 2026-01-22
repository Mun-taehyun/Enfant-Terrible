package com.enfantTerrible.enfantTerrible.service.order;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.OrderStatus;
import com.enfantTerrible.enfantTerrible.dto.order.OrderCreateCommand;
import com.enfantTerrible.enfantTerrible.dto.order.OrderCreateResponse;
import com.enfantTerrible.enfantTerrible.dto.order.OrderItemCommand;
import com.enfantTerrible.enfantTerrible.dto.point.PointChangeRequest;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.order.OrderItemMapper;
import com.enfantTerrible.enfantTerrible.mapper.order.OrderMapper;
import com.enfantTerrible.enfantTerrible.mapper.order.StockMapper;
import com.enfantTerrible.enfantTerrible.service.point.PointService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

  private final OrderMapper orderMapper;
  private final OrderItemMapper orderItemMapper;
  private final StockMapper stockMapper;
  private final PointService pointService;

  public OrderCreateResponse create(OrderCreateCommand cmd) {

    if (cmd.getItems() == null || cmd.getItems().isEmpty()) {
      throw new BusinessException("주문 상품이 없습니다.");
    }

    // 가격 검증 및 총액 계산 (원금)
    long originalAmount = 0;
    for (OrderItemCommand item : cmd.getItems()) {
      // 가격 유효성 검증
      if (item.getPrice() == null || item.getPrice() <= 0) {
        throw new BusinessException("상품 가격이 유효하지 않습니다.");
      }
      
      // 수량 유효성 검증
      if (item.getQuantity() == null || item.getQuantity() <= 0) {
        throw new BusinessException("주문 수량이 유효하지 않습니다.");
      }
      
      originalAmount += item.getPrice() * item.getQuantity();
    }

    int usedPoint = cmd.getUsedPoint() == null ? 0 : cmd.getUsedPoint();
    if (usedPoint < 0) {
      throw new BusinessException("사용 포인트가 올바르지 않습니다.");
    }

    if (usedPoint > originalAmount) {
      usedPoint = (int) Math.min(Integer.MAX_VALUE, originalAmount);
    }

    long totalAmount = originalAmount - usedPoint;

    String orderCode = "ORD-" + UUID.randomUUID();

    orderMapper.insertOrder(
        cmd.getUserId(),
        orderCode,
        OrderStatus.ORDERED.name(),
        originalAmount,
        usedPoint,
        0,
        totalAmount,
        cmd.getReceiverName(),
        cmd.getReceiverPhone(),
        cmd.getZipCode(),
        cmd.getAddressBase(),
        cmd.getAddressDetail()
    );

    Long orderId = orderMapper.findLastInsertId();

    if (usedPoint > 0) {
      PointChangeRequest pointReq = new PointChangeRequest();
      pointReq.setAmount(usedPoint);
      pointReq.setReason("주문 사용");
      pointReq.setRefType("ORDER");
      pointReq.setRefId(orderId);
      pointService.use(cmd.getUserId(), pointReq);
    }

    for (OrderItemCommand item : cmd.getItems()) {

      // 재고 감소 및 검증
      int affected = stockMapper.decreaseStock(item.getSkuId(), item.getQuantity());
      if (affected == 0) {
        throw new BusinessException("재고가 부족한 상품이 있습니다.");
      }

      orderItemMapper.insertOrderItem(
          orderId,
          item.getSkuId(),
          item.getProductName(),
          item.getPrice(),
          item.getQuantity()
      );
    }

    OrderCreateResponse res = new OrderCreateResponse();
    res.setOrderId(orderId);
    res.setOrderCode(orderCode);
    res.setTotalAmount(totalAmount);
    return res;
  }
}
