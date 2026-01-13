package com.enfantTerrible.enfantTerrible.event;

public class ProductViewedEvent {

  private final Long userId;     // null 가능 (비회원)
  private final Long productId;

  public ProductViewedEvent(Long userId, Long productId) {
    this.userId = userId;
    this.productId = productId;
  }

  public Long getUserId() {
    return userId;
  }

  public Long getProductId() {
    return productId;
  }
}
