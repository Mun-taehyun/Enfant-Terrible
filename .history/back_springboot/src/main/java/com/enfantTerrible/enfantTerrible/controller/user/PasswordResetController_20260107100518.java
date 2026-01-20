package com.enfantTerrible.enfantTerrible.controller.user;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.dto.auth.EmailRequest;
import com.enfantTerrible.enfantTerrible.dto.auth.EmailVerificationRequest;
import com.enfantTerrible.enfantTerrible.service.auth.EmailVerificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth/password/reset")
public class PasswordResetController {

  private final EmailVerificationService emailVerificationService;

  /**
   * 비밀번호 재설정 인증 메일 발송
   */
  @PostMapping("/request")
  public void request(
    @Valid @RequestBody EmailRequest req
  ) {
    emailVerificationService.sendPasswordResetVerification(req.getEmail());
  }

  /**
   * 인증 코드 확인
   */
  @PostMapping("/verify")
  public void verify(
    @Valid @RequestBody EmailVerificationRequest req
  ) {
    emailVerificationService.verifyPasswordResetCode(
      req.getEmail(),
      req.getCode()
    );
  }
}

