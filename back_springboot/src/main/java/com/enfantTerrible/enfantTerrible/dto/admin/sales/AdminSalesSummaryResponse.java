package com.enfantTerrible.enfantTerrible.dto.admin.sales;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminSalesSummaryResponse {

  private Long totalAmount;
  private Integer totalCount;

  private List<AdminSalesSummaryRow> items;
}
