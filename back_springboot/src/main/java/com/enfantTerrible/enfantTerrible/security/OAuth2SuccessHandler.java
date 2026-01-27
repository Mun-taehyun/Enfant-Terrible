package com.enfantTerrible.enfantTerrible.security;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.enfantTerrible.enfantTerrible.common.enums.UserRole;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

  private final JwtTokenProvider jwtTokenProvider;
  private final String redirectUri;

  public OAuth2SuccessHandler(
    JwtTokenProvider jwtTokenProvider,
    @Value("${app.oauth2.redirect-uri}") String redirectUri
  ) {
    this.jwtTokenProvider = jwtTokenProvider;
    this.redirectUri = redirectUri;
  }

  @Override
  public void onAuthenticationSuccess(
    HttpServletRequest request,
    HttpServletResponse response,
    Authentication authentication
  ) throws IOException {

    // 1️⃣ OAuth Authentication 검증 (방어 코드)
    if (!(authentication.getPrincipal() instanceof CustomOAuth2User oAuth2User)) {
      response.sendError(
        HttpServletResponse.SC_UNAUTHORIZED,
        "Invalid OAuth2 authentication"
      );
      return;
    }

    // 2️⃣ 사용자 정보 추출
    Long userId = oAuth2User.getUserId();
    UserRole role = oAuth2User.getRole();

    // 3️⃣ Access Token 발급 (refresh token 미사용)
    String accessToken =
      jwtTokenProvider.createAccessToken(userId, role);

    // 4️⃣ Redirect URL 생성
    // 프론트 예: /oauth/callback?accessToken=xxx
    String redirectUrl =
      redirectUri +
      "?accessToken=" +
      URLEncoder.encode(accessToken, StandardCharsets.UTF_8);

    // 5️⃣ 리다이렉트
    response.sendRedirect(redirectUrl);
  }
}
