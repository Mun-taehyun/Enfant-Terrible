package com.enfantTerrible.enfantTerrible.controller.user;

import org.springframework.web.bind.annotation.*;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.auth.EmailRequest;
import com.enfantTerrible.enfantTerrible.dto.auth.EmailVerificationRequest;
import com.enfantTerrible.enfantTerrible.dto.user.ResetPasswordRequest;
import com.enfantTerrible.enfantTerrible.service.auth.EmailVerificationService;
import com.enfantTerrible.enfantTerrible.service.user.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth/password/reset")
public class PasswordResetController {

  private final UserService userService;
  private final EmailVerificationService emailVerificationService;

  /**
   * 비밀번호 재설정 인증 메일 발송
   */
  @PostMapping("/request")
  public ApiResponse<Void> request(
    @Valid @RequestBody EmailRequest req
  ) {
    emailVerificationService.sendPasswordResetVerification(req.getEmail());
    return ApiResponse.successMessage("비밀번호 재설정 인증 메일 발송 완료");
  }

  /**
   * 인증 코드 확인
   */
  @PostMapping("/verify")
  public ApiResponse<Void> verify(
    @Valid @RequestBody EmailVerificationRequest req
  ) {
    emailVerificationService.verifyPasswordResetCode(
      req.getEmail(),
      req.getCode()
    );
    return ApiResponse.successMessage("인증 코드 확인 완료");
  }

  /**
   * 비밀번호 재설정
   */
  @PutMapping
  public ApiResponse<Void> resetPassword(
    @Valid @RequestBody ResetPasswordRequest req
  ) {
    userService.resetPassword(req);
    return ApiResponse.successMessage("비밀번호 재설정 완료");
  }
}
