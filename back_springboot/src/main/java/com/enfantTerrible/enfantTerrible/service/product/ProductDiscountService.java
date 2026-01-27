package com.enfantTerrible.enfantTerrible.service.product;

import org.springframework.stereotype.Service;

@Service
public class ProductDiscountService {

  public long applyDiscount(long price, String discountType, Integer discountValue) {
    if (discountType == null || discountValue == null) {
      return price;
    }

    if (price < 0) {
      return price;
    }

    switch (discountType) {
      case "rate" -> {
        if (discountValue <= 0) return price;
        if (discountValue >= 100) return 0L;
        return Math.max(0L, price - (price * discountValue / 100L));
      }
      case "amount" -> {
        if (discountValue <= 0) return price;
        return Math.max(0L, price - discountValue.longValue());
      }
      default -> {
        return price;
      }
    }
  }
}
