package com.enfantTerrible.enfantTerrible.controller.auth;

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
@RequestMapping("/api/auth/email")
public class EmailVerificationController {

  private final EmailVerificationService emailVerificationService;

  /**
   * 회원가입용 이메일 인증 요청
   */
  @PostMapping("/signup")
  public void sendSignupVerification(
    @Valid @RequestBody EmailRequest req
  ) {
    emailVerificationService.sendSignupVerification(req.getEmail());
  }

  /**
   * 회원가입용 이메일 인증 확인
   */
  @PostMapping("/verify")
  public void verifySignupEmail(
    @Valid @RequestBody EmailVerificationRequest req
  ) {
    emailVerificationService.verifySignupEmail(
      req.getEmail(),
      req.getCode()
    );
  }
}
