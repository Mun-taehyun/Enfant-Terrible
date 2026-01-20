package com.enfantTerrible.enfantTerrible.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class CustomUserDetails implements UserDetails {

  private final Long userId;
  private final String email;
  private final String role;
  private final String status;        // ACTIVE / SUSPENDED

  public CustomUserDetails(
    Long userId,
    String email,
    String role,
    String status
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
    return List.of(new SimpleGrantedAuthority("ROLE_" + role));
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
    return "ACTIVE".equals(status);
  }

  @Override
  public boolean isEnabled() {
    return true;
  }

  @Override public boolean isAccountNonExpired() { return true; }
  @Override public boolean isCredentialsNonExpired() { return true; }
}
