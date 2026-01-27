package com.enfantTerrible.enfantTerrible.service.payment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PortOneCancelPaymentResponse {

  private String cancelledAt;

  public String getCancelledAt() {
    return cancelledAt;
  }

  public void setCancelledAt(String cancelledAt) {
    this.cancelledAt = cancelledAt;
  }
}
