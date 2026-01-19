package com.enfantTerrible.enfantTerrible.service.order;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.OrderStatus;
import com.enfantTerrible.enfantTerrible.dto.order.OrderCreateCommand;
import com.enfantTerrible.enfantTerrible.dto.order.OrderCreateResponse;
import com.enfantTerrible.enfantTerrible.dto.order.OrderItemCommand;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.order.OrderItemMapper;
import com.enfantTerrible.enfantTerrible.mapper.order.OrderMapper;
import com.enfantTerrible.enfantTerrible.mapper.order.StockMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

  private final OrderMapper orderMapper;
  private final OrderItemMapper orderItemMapper;
  private final StockMapper stockMapper;

  public OrderCreateResponse create(OrderCreateCommand cmd) {

    if (cmd.getItems() == null || cmd.getItems().isEmpty()) {
      throw new BusinessException("주문 상품이 없습니다.");
    }

    long totalAmount = cmd.getItems().stream()
        .mapToLong(i -> i.getPrice() * i.getQuantity())
        .sum();

    String orderCode = "ORD-" + UUID.randomUUID();

    orderMapper.insertOrder(
        cmd.getUserId(),
        orderCode,
        OrderStatus.ORDERED.name(),
        totalAmount,
        cmd.getReceiverName(),
        cmd.getReceiverPhone(),
        cmd.getZipCode(),
        cmd.getAddressBase(),
        cmd.getAddressDetail()
    );

    Long orderId = orderMapper.findLastInsertId();

    for (OrderItemCommand item : cmd.getItems()) {

      if (stockMapper.decreaseStock(item.getSkuId(), item.getQuantity()) == 0) {
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
