package com.enfantTerrible.enfantTerrible.security;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class CustomUserPrincipal {

  private final Long userId;
  private final String role;   // USER, ADMIN
}
