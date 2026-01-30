package com.enfantTerrible.enfantTerrible.security;

import java.util.Collection;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.enfantTerrible.enfantTerrible.common.enums.UserRole;
import com.enfantTerrible.enfantTerrible.common.enums.UserStatus;

public class CustomOAuth2User implements OAuth2User {

  private final Long userId;
  private final String email;
  private final UserRole role;
  private final UserStatus status;
  private final Map<String, Object> attributes;

  public CustomOAuth2User(
    Long userId,
    String email,
    UserRole role,
    UserStatus status,
    Map<String, Object> attributes
  ) {
    this.userId = userId;
    this.email = email;
    this.role = role;
    this.status = status;
    this.attributes = attributes;
  }

  public Long getUserId() { return userId; }
  public String getEmail() { return email; }
  public UserRole getRole() { return role; }
  public UserStatus getStatus() { return status; }

  @Override
  public Map<String, Object> getAttributes() {
    return attributes;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return AuthorityUtils.createAuthorityList(
        role.getSecurityRole()
    );
  }

  @Override
  public String getName() {
    return String.valueOf(userId);
  }
}
