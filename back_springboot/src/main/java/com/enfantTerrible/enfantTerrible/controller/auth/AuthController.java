package com.enfantTerrible.enfantTerrible.controller.auth;

import org.springframework.web.bind.annotation.*;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.auth.LoginRequest;
import com.enfantTerrible.enfantTerrible.dto.auth.LoginResponse;
import com.enfantTerrible.enfantTerrible.service.auth.AuthService;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;

  @PostMapping("/login")
  public ApiResponse<LoginResponse> login(
    @RequestBody LoginRequest req
  ) {
    return ApiResponse.success(
      authService.login(req),
      "로그인 성공"
    );
  }

  @PostMapping("/refresh")
  public ApiResponse<LoginResponse> refresh(
    @RequestHeader(value = "Authorization", required = false) String authorization
  ) {
    if (authorization == null || !authorization.startsWith("Bearer ")) {
      throw new BusinessException("리프레시 토큰이 필요합니다.");
    }

    String refreshToken = authorization.substring("Bearer ".length()).trim();
    return ApiResponse.success(
      authService.refresh(refreshToken),
      "토큰 재발급 성공"
    );
  }
}
