package com.enfantTerrible.enfantTerrible.service.payment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PortOnePaymentResponse {

  private String id;
  private String status;
  private String paidAt;
  private Amount amount;
  private PaymentMethod paymentMethod;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public String getPaidAt() {
    return paidAt;
  }

  public void setPaidAt(String paidAt) {
    this.paidAt = paidAt;
  }

  public Amount getAmount() {
    return amount;
  }

  public void setAmount(Amount amount) {
    this.amount = amount;
  }

  public PaymentMethod getPaymentMethod() {
    return paymentMethod;
  }

  public void setPaymentMethod(PaymentMethod paymentMethod) {
    this.paymentMethod = paymentMethod;
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  public static class Amount {
    private Long total;

    public Long getTotal() {
      return total;
    }

    public void setTotal(Long total) {
      this.total = total;
    }
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  public static class PaymentMethod {
    private String type;

    public String getType() {
      return type;
    }

    public void setType(String type) {
      this.type = type;
    }
  }
}
