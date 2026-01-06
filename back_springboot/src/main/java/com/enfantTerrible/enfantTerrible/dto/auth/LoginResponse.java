package com.enfantTerrible.enfantTerrible.dto.auth;

import com.enfantTerrible.enfantTerrible.dto.user.UserResponse;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {

  private String accessToken;
  private UserResponse user;
}
