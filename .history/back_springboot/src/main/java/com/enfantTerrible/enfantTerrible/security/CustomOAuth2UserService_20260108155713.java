package com.enfantTerrible.enfantTerrible.security;

import java.util.Map;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.enfantTerrible.enfantTerrible.dto.user.UserRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.service.auth.AuthService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

  private static final String PROVIDER_GOOGLE = "google";
  private static final String PROVIDER_NAVER  = "naver";

  private final AuthService authService;

  @Override
  public OAuth2User loadUser(OAuth2UserRequest userRequest)
    throws OAuth2AuthenticationException {

    // 1️⃣ 기본 OAuth2User 로드 (Spring Security 기본 처리)
    OAuth2User oAuth2User = super.loadUser(userRequest);

    // 2️⃣ provider 식별자 (google, naver)
    String provider =
      userRequest.getClientRegistration().getRegistrationId();

    // 3️⃣ OAuth provider 원본 attributes
    Map<String, Object> attributes = oAuth2User.getAttributes();

    // 4️⃣ provider별 고유 사용자 ID 추출
    String providerUserId = extractProviderUserId(provider, attributes);

    // 5️⃣ 로그인 처리 (조회 or 신규 생성)
    UserRow user = authService.oauthLogin(
      provider,
      providerUserId,
      attributes
    );

    // 6️⃣ Security Context에 저장될 OAuth Principal 반환
    return new CustomOAuth2User(
      user.getUserId(),
      user.getRole(),
      attributes   // 현재 단계에서는 그대로 유지
    );
  }

  /**
   * OAuth provider별 고유 사용자 ID 추출
   */
  @SuppressWarnings("unchecked")
  private String extractProviderUserId(
    String provider,
    Map<String, Object> attributes
  ) {

    if (PROVIDER_GOOGLE.equals(provider)) {
      Object sub = attributes.get("sub");
      if (sub == null) {
        throw new BusinessException("Google OAuth 사용자 식별자를 찾을 수 없습니다.");
      }
      return String.valueOf(sub);
    }

    if (PROVIDER_NAVER.equals(provider)) {
      Map<String, Object> response =
        (Map<String, Object>) attributes.get("response");

      if (response == null || !response.containsKey("id")) {
        throw new BusinessException("Naver OAuth 사용자 식별자를 찾을 수 없습니다.");
      }

      return String.valueOf(response.get("id"));
    }

    throw new BusinessException(
      "지원하지 않는 OAuth 제공자입니다: " + provider
    );
  }
}
