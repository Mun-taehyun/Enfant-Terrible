package com.enfantTerrible.enfantTerrible.controller.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.enfantTerrible.enfantTerrible.dto.user.ChangePasswordRequest;
import com.enfantTerrible.enfantTerrible.dto.user.CompleteProfileRequest;
import com.enfantTerrible.enfantTerrible.dto.user.ResetPasswordRequest;
import com.enfantTerrible.enfantTerrible.dto.user.SignupRequest;
import com.enfantTerrible.enfantTerrible.dto.user.UpdateProfileRequest;
import com.enfantTerrible.enfantTerrible.dto.user.UserResponse;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.service.user.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

  private final UserService userService;

  /**
   * 회원가입
   */
  @PostMapping("/signup")
  public ResponseEntity<UserResponse> signup(
    @Valid @RequestBody SignupRequest req
  ) {
    return ResponseEntity.ok(userService.signup(req));
  }

  /**
   * 내 정보 조회
   * (JWT 인증 필요)
   */
  @GetMapping("/me")
  public ResponseEntity<UserResponse> me(
    @AuthenticationPrincipal CustomUserPrincipal principal
  ) {
    return ResponseEntity.ok(
      userService.getMyInfo(principal.getUserId())
    );
  }

  /**
   * 회원정보 수정
   */
  @PutMapping("/me")
  public ResponseEntity<UserResponse> updateProfile(
    @AuthenticationPrincipal CustomUserPrincipal principal,
    @Valid @RequestBody UpdateProfileRequest req
  ) {
    return ResponseEntity.ok(
      userService.updateProfile(principal.getUserId(), req)
    );
  }

  /**
   * 내정보 → 비밀번호 변경
   */
  @PutMapping("/me/password")
  public ResponseEntity<Void> changePassword(
    @AuthenticationPrincipal CustomUserPrincipal principal,
    @Valid @RequestBody ChangePasswordRequest req
  ) {
    userService.changePassword(principal.getUserId(), req);
    return ResponseEntity.ok().build();
  }

  /**
   * 비밀번호 찾기 → 이메일 인증 후 비밀번호 재설정
   * (JWT 인증 필요 없음)
   */
  @PutMapping("/password/reset")
  public ResponseEntity<Void> resetPassword(
    @Valid @RequestBody ResetPasswordRequest req
  ) {
    userService.resetPassword(req);
    return ResponseEntity.ok().build();
  }

  /**
   * 회원 탈퇴
   */
  @DeleteMapping("/me")
  public ResponseEntity<Void> delete(
    @AuthenticationPrincipal CustomUserPrincipal principal
  ) {
    userService.delete(principal.getUserId());
    return ResponseEntity.noContent().build();
  }

  /**
   * OAuth 최초 로그인 후 필수 정보 입력
   */
  @PostMapping("/me/profile/complete")
  public ResponseEntity<Void> completeProfile(
    @AuthenticationPrincipal CustomUserPrincipal principal,
    @Valid @RequestBody CompleteProfileRequest req
  ) {
    userService.completeProfile(principal.getUserId(), req);
    return ResponseEntity.ok().build();
  }
}
