package com.enfantTerrible.enfantTerrible.controller.auth;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.dto.auth.LoginRequest;
import com.enfantTerrible.enfantTerrible.dto.auth.LoginResponse;
import com.enfantTerrible.enfantTerrible.service.auth.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;
  
  @PostMapping("/login")
  public LoginResponse login(
    @Valid @RequestBody LoginRequest req
  ) {
    return authService.login(req);
  }
}
