package com.enfantTerrible.enfantTerrible.controller.admin.payment;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.payment.AdminPaymentCancelRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.payment.AdminPaymentDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.payment.AdminPaymentListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.payment.AdminPaymentListResponse;
import com.enfantTerrible.enfantTerrible.service.admin.payment.AdminPaymentService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/payments")
public class AdminPaymentController {

  private final AdminPaymentService adminPaymentService;

  @GetMapping
  public ApiResponse<AdminPageResponse<AdminPaymentListResponse>> list(
      AdminPaymentListRequest req
  ) {
    return ApiResponse.success(
        adminPaymentService.getPayments(req),
        "관리자 결제 목록 조회 성공"
    );
  }

  @GetMapping("/{paymentId}")
  public ApiResponse<AdminPaymentDetailResponse> detail(
      @PathVariable Long paymentId
  ) {
    return ApiResponse.success(
        adminPaymentService.getPayment(paymentId),
        "관리자 결제 상세 조회 성공"
    );
  }

  @PostMapping("/{paymentId}/cancel")
  public ApiResponse<Void> cancel(
      @PathVariable Long paymentId,
      @RequestBody AdminPaymentCancelRequest req
  ) {
    adminPaymentService.cancelPayment(paymentId, req);
    return ApiResponse.successMessage("관리자 환불 처리 완료");
  }
}
