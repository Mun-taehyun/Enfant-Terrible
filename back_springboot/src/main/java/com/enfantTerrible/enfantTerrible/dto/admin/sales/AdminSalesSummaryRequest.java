package com.enfantTerrible.enfantTerrible.dto.admin.sales;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminSalesSummaryRequest {

  private LocalDateTime paidFrom;
  private LocalDateTime paidTo;

  // DAY / MONTH
  private String groupBy = "DAY";
}
