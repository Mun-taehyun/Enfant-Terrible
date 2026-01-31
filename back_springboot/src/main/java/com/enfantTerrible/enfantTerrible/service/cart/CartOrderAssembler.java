package com.enfantTerrible.enfantTerrible.service.cart;

import java.util.List;

import org.springframework.stereotype.Component;

import com.enfantTerrible.enfantTerrible.dto.cart.CartItemResponse;
import com.enfantTerrible.enfantTerrible.dto.order.OrderCreateCommand;
import com.enfantTerrible.enfantTerrible.dto.order.OrderItemCommand;

@Component
public class CartOrderAssembler {

  public OrderCreateCommand fromCart(
      Long userId,
      String orderCode,
      List<CartItemResponse> cartItems,
      String receiverName,
      String receiverPhone,
      String zipCode,
      String addressBase,
      String addressDetail,
      Integer usedPoint
  ) {

    OrderCreateCommand cmd = new OrderCreateCommand();
    cmd.setUserId(userId);
    cmd.setOrderCode(orderCode);
    cmd.setReceiverName(receiverName);
    cmd.setReceiverPhone(receiverPhone);
    cmd.setZipCode(zipCode);
    cmd.setAddressBase(addressBase);
    cmd.setAddressDetail(addressDetail);
    cmd.setUsedPoint(usedPoint);

    cmd.setItems(
        cartItems.stream()
            .filter(CartItemResponse::getIsBuyable)
            .map(c -> {
              OrderItemCommand item = new OrderItemCommand();
              item.setSkuId(c.getSkuId());
              item.setPrice(c.getPrice());
              item.setQuantity(c.getQuantity());
              item.setProductName(c.getProductName());
              return item;
            }).toList()
    );

    return cmd;
  }
}
