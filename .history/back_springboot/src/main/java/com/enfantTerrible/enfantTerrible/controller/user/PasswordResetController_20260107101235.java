package com.enfantTerrible.enfantTerrible.controller.user;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

  /**
   * 비밀번호 찾기 → 이메일 인증 후 비밀번호 재설정
   * (JWT 인증 필요 없음)
   */
  @PutMapping
  public ResponseEntity<Void> resetPassword(
    @Valid @RequestBody ResetPasswordRequest req
  ) {
    userService.resetPassword(req);
    return ResponseEntity.ok().build();
  }
}

