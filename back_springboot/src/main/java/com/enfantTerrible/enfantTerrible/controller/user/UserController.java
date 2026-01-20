package com.enfantTerrible.enfantTerrible.controller.user;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.user.ChangePasswordRequest;
import com.enfantTerrible.enfantTerrible.dto.user.CompleteProfileRequest;
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
  public ApiResponse<UserResponse> signup(
    @Valid @RequestBody SignupRequest req
  ) {
    UserResponse result = userService.signup(req);
    return ApiResponse.success(result, "회원가입 완료");
  }

  /**
   * 내 정보 조회
   */
  @GetMapping("/me")
  public ApiResponse<UserResponse> me(
    @AuthenticationPrincipal CustomUserPrincipal principal
  ) {
    UserResponse result = userService.getMyInfo(principal.getUserId());
    return ApiResponse.success(result, "내 정보 조회 성공");
  }

  /**
   * 회원정보 수정
   */
  @PutMapping("/me")
  public ApiResponse<UserResponse> updateProfile(
    @AuthenticationPrincipal CustomUserPrincipal principal,
    @Valid @RequestBody UpdateProfileRequest req
  ) {
    UserResponse result =
      userService.updateProfile(principal.getUserId(), req);

    return ApiResponse.success(result, "회원정보 수정 완료");
  }

  /**
   * 내 정보 → 비밀번호 변경
   */
  @PutMapping("/me/password")
  public ApiResponse<Void> changePassword(
    @AuthenticationPrincipal CustomUserPrincipal principal,
    @Valid @RequestBody ChangePasswordRequest req
  ) {
    userService.changePassword(principal.getUserId(), req);
    return ApiResponse.successMessage("비밀번호 변경 완료");
  }

  /**
   * 회원 탈퇴
   */
  @DeleteMapping("/me")
  public ApiResponse<Void> delete(
    @AuthenticationPrincipal CustomUserPrincipal principal
  ) {
    userService.delete(principal.getUserId());
    return ApiResponse.successMessage("회원 탈퇴 완료");
  }

  /**
   * OAuth 최초 로그인 후 필수 정보 입력
   */
  @PostMapping("/me/profile/complete")
  public ApiResponse<Void> completeProfile(
    @AuthenticationPrincipal CustomUserPrincipal principal,
    @Valid @RequestBody CompleteProfileRequest req
  ) {
    userService.completeProfile(principal.getUserId(), req);
    return ApiResponse.successMessage("추가 정보 입력 완료");
  }
}
