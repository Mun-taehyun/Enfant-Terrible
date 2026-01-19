package com.enfantTerrible.enfantTerrible.security;

import java.security.Principal;

import com.enfantTerrible.enfantTerrible.common.enums.UserRole;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class CustomUserPrincipal implements Principal {

  private final Long userId;
  private final UserRole role;   // USER, ADMIN

  @Override
  public String getName() {
    return String.valueOf(userId);
  }
}
