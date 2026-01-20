package com.enfantTerrible.enfantTerrible.controller.auth;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.service.auth.EmailVerificationService;

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
    @RequestParam String email
  ) {
    emailVerificationService.sendSignupVerification(email);
  }

  /**
   * 회원가입용 이메일 인증 확인
   */
  @PostMapping("/verify")
  public void verifySignupEmail(
    @RequestParam String email,
    @RequestParam String code
  ) {
    emailVerificationService.verifySignupEmail(email, code);
  }
}
