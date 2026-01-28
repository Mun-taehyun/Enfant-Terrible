package com.enfantTerrible.enfantTerrible.controller.payment;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.payment.PaymentCancelRequest;
import com.enfantTerrible.enfantTerrible.dto.payment.PaymentCancelResponse;
import com.enfantTerrible.enfantTerrible.dto.payment.PaymentConfirmRequest;
import com.enfantTerrible.enfantTerrible.dto.payment.PaymentConfirmResponse;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.service.payment.PaymentService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {

  private final PaymentService paymentService;

  @PostMapping("/confirm")
  public ApiResponse<PaymentConfirmResponse> confirm(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @RequestBody PaymentConfirmRequest req
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    return ApiResponse.success(
        paymentService.confirm(principal.getUserId(), req),
        "결제 승인 성공"
    );
  }

  @PostMapping("/cancel")
  public ApiResponse<PaymentCancelResponse> cancel(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @RequestBody PaymentCancelRequest req
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    return ApiResponse.success(
        paymentService.cancel(principal.getUserId(), req),
        "결제 취소 성공"
    );
  }
}
