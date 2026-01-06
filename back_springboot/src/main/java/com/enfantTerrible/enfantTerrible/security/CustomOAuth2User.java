package com.enfantTerrible.enfantTerrible.security;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

public class CustomOAuth2User implements OAuth2User {

  private final Long userId;
  private final String role;
  private final Map<String, Object> attributes;

  public CustomOAuth2User(Long userId, String role, Map<String, Object> attributes) {
    this.userId = userId;
    this.role = role;
    this.attributes = attributes;
  }

  public Long getUserId() { return userId; }
  public String getRole() { return role; }

  @Override
  public Map<String, Object> getAttributes() {
    return attributes;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority("ROLE_" + role));
  }

  @Override
  public String getName() {
    return String.valueOf(userId);
  }
}
