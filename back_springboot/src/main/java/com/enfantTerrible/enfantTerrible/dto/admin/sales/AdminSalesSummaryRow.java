package com.enfantTerrible.enfantTerrible.dto.admin.sales;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminSalesSummaryRow {

  private String period;
  private Long totalAmount;
  private Integer paymentCount;
}
