package com.enfantTerrible.enfantTerrible.event;

public class ProductViewedEvent {

  private final Long userId;     // null 가능 (비회원)
  private final Long productId;
  private final String sessionId;
  private final String clientIp;
  private final String userAgent;

  public ProductViewedEvent(
      Long userId,
      Long productId,
      String sessionId,
      String clientIp,
      String userAgent
  ) {
    this.userId = userId;
    this.productId = productId;
    this.sessionId = sessionId;
    this.clientIp = clientIp;
    this.userAgent = userAgent;
  }

  public Long getUserId() {
    return userId;
  }

  public Long getProductId() {
    return productId;
  }

  public String getSessionId() {
    return sessionId;
  }

  public String getClientIp() {
    return clientIp;
  }

  public String getUserAgent() {
    return userAgent;
  }
}
