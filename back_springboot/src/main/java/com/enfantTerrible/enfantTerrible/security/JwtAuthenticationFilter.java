package com.enfantTerrible.enfantTerrible.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.enfantTerrible.enfantTerrible.common.enums.UserRole;
import com.enfantTerrible.enfantTerrible.common.enums.UserStatus;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtTokenProvider jwtTokenProvider;

  public JwtAuthenticationFilter(
    JwtTokenProvider jwtTokenProvider
  ) {
    this.jwtTokenProvider = jwtTokenProvider;
  }

  @Override
  protected void doFilterInternal(
    HttpServletRequest request,
    HttpServletResponse response,
    FilterChain filterChain
  ) throws ServletException, IOException {

    String header = request.getHeader("Authorization");

    if (header != null && header.startsWith("Bearer ")) {
      String token = header.substring(7);

      try {
        // 1️⃣ 토큰 검증
        jwtTokenProvider.validateOrThrow(token);

        if (!"ACCESS".equals(jwtTokenProvider.getTokenType(token))) {
          throw new IllegalStateException("Not an access token");
        }

        // 2️⃣ 토큰에서 userId 추출
        Long userId = jwtTokenProvider.getUserId(token);

        String roleStr = jwtTokenProvider.getRole(token);
        String email = jwtTokenProvider.getEmail(token);
        String statusStr = jwtTokenProvider.getStatus(token);

        UserRole role = roleStr == null ? null : UserRole.valueOf(roleStr);
        UserStatus status = statusStr == null ? UserStatus.ACTIVE : UserStatus.valueOf(statusStr);

        if (role == null) {
          throw new IllegalStateException("Missing role claim");
        }

        if (email == null || email.isBlank()) {
          email = String.valueOf(userId);
        }

        // 4️⃣ CustomUserDetails (정식 생성자)
        CustomUserDetails details =
          new CustomUserDetails(
            userId,
            email,
            role,          // USER / ADMIN
            status        // ACTIVE / SUSPENDED
          );

        // 5️⃣ Principal (최소 정보)
        CustomUserPrincipal principal =
          new CustomUserPrincipal(
            userId,
            role
          );

        // 6️⃣ Authentication 생성
        Authentication auth =
          new UsernamePasswordAuthenticationToken(
            principal,
            null,
            details.getAuthorities()
          );

        SecurityContextHolder.getContext().setAuthentication(auth);

      } catch (Exception e) {
        SecurityContextHolder.clearContext();
      }
    }

    filterChain.doFilter(request, response);
  }

  // OAuth 필터 경로 제외
  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    String uri = request.getRequestURI();
    String method = request.getMethod();

    // CORS preflight
    if ("OPTIONS".equals(method)) {
      return true;
    }

    // 인증 / OAuth
    if (uri.startsWith("/api/auth/")
        || uri.startsWith("/oauth2/")
        || uri.startsWith("/login/oauth2/")
        || uri.startsWith("/ws/")
    ) {
      return true;
    }

    // 회원가입
    if ("POST".equals(method) && uri.equals("/api/users/signup")) {
      return true;
    }

    // 공개 GET API
    if ("GET".equals(method)) {
      if (uri.startsWith("/api/categories/")
          || uri.startsWith("/api/posts/")
          || uri.startsWith("/api/banners/")
          || uri.startsWith("/api/popups/")
          || uri.equals("/api/products")
          || uri.matches("^/api/products/[^/]+$")
          || uri.matches("^/api/products/[^/]+/reviews$")
      ) {
        return true;
      }
    }

    return false;
  }
}

