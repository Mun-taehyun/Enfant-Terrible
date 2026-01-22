package com.enfantTerrible.enfantTerrible.controller.admin.sales;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.sales.AdminSalesSummaryRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.sales.AdminSalesSummaryResponse;
import com.enfantTerrible.enfantTerrible.service.admin.sales.AdminSalesService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/sales")
public class AdminSalesController {

  private final AdminSalesService adminSalesService;

  @GetMapping
  public ApiResponse<AdminSalesSummaryResponse> summary(AdminSalesSummaryRequest req) {
    return ApiResponse.success(
        adminSalesService.getSalesSummary(req),
        "관리자 기간별 매출 조회 성공"
    );
  }
}
