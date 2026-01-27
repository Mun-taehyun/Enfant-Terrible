package com.enfantTerrible.enfantTerrible.controller.auth;

import org.springframework.web.bind.annotation.*;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.auth.EmailRequest;
import com.enfantTerrible.enfantTerrible.dto.auth.EmailVerificationRequest;
import com.enfantTerrible.enfantTerrible.service.auth.EmailVerificationService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth/email")
public class EmailVerificationController {

  private final EmailVerificationService emailVerificationService;

  /**
   * 회원가입 이메일 인증 요청
   */
  @PostMapping("/signup")
  public ApiResponse<Void> sendSignupVerification(
    @RequestBody EmailRequest req
  ) {
    emailVerificationService.sendSignupVerification(req.getEmail());
    return ApiResponse.successMessage("이메일 인증 코드 발송 완료");
  }

  /**
   * 회원가입 이메일 인증 확인
   */
  @PostMapping("/verify")
  public ApiResponse<Void> verifySignupEmail(
    @RequestBody EmailVerificationRequest req
  ) {
    emailVerificationService.verifySignupEmail(
      req.getEmail(),
      req.getCode()
    );
    return ApiResponse.successMessage("이메일 인증 완료");
  }
}
