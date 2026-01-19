package com.enfantTerrible.enfantTerrible.security;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;

import com.enfantTerrible.enfantTerrible.common.enums.UserRole;
import com.enfantTerrible.enfantTerrible.common.enums.UserStatus;

public class CustomUserDetails implements UserDetails {

  private final Long userId;
  private final String email;
  private final UserRole role;
  private final UserStatus status;

  public CustomUserDetails(
    Long userId,
    String email,
    UserRole role,
    UserStatus status
  ) {
    this.userId = userId;
    this.email = email;
    this.role = role;
    this.status = status;
  }

  public Long getUserId() {
    return userId;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return AuthorityUtils.createAuthorityList(
        role.getSecurityRole()
    );
  }

  @Override
  public String getUsername() {
    return email;
  }

  @Override
  public String getPassword() {
    return null; 
  }

  @Override
  public boolean isAccountNonLocked() {
    return status == UserStatus.ACTIVE;
  }

  @Override
  public boolean isEnabled() {
    return true;
  }

  @Override public boolean isAccountNonExpired() { return true; }
  @Override public boolean isCredentialsNonExpired() { return true; }
}
