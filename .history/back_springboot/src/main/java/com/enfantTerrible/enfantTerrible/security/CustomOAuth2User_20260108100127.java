package com.enfantTerrible.enfantTerrible.security;

import java.util.Collection;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.enfantTerrible.enfantTerrible.common.enums.UserRole;

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
    UserRole userRole = UserRole.from(role);
    return AuthorityUtils.createAuthorityList(
        userRole.getSecurityRole()
    );
  }

  @Override
  public String getName() {
    return String.valueOf(userId);
  }
}
