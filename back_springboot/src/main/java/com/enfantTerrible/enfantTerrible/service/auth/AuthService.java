package com.enfantTerrible.enfantTerrible.service.auth;

import java.util.Map;
import java.util.UUID;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.UserRole;
import com.enfantTerrible.enfantTerrible.common.enums.UserStatus;
import com.enfantTerrible.enfantTerrible.dto.auth.LoginRequest;
import com.enfantTerrible.enfantTerrible.dto.auth.LoginResponse;
import com.enfantTerrible.enfantTerrible.dto.user.UserRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.user.UserMapper;
import com.enfantTerrible.enfantTerrible.security.JwtTokenProvider;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

  private final UserMapper userMapper;
  private final PasswordEncoder passwordEncoder;
  private final JwtTokenProvider jwtTokenProvider;

  /**
   * LOCAL 로그인
   */
  public LoginResponse login(LoginRequest req) {

    UserRow user = userMapper.findByEmail(req.getEmail());
    if (user == null) {
      throw new BusinessException("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
      throw new BusinessException("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
    
    if (user.getStatus() != UserStatus.ACTIVE) {
      throw new BusinessException("사용할 수 없는 계정입니다.");
    }

    userMapper.updateLastLogin(user.getUserId());

    String accessToken = jwtTokenProvider.createAccessToken(
        user.getUserId(),
        user.getEmail(),
        user.getRole(),
        user.getStatus()
    );
    String refreshToken = jwtTokenProvider.createRefreshToken(user.getUserId());

    return new LoginResponse(accessToken, refreshToken);
  }

  /**
   * OAuth2 로그인 (신규 사용자 생성 또는 기존 사용자 조회)
   */
  public UserRow processOAuth2Login(String provider, String providerUserId, Map<String, Object> attributes) {

    // 기존 소셜 계정 조회
    Map<String, Object> social = userMapper.findSocialAccount(provider, providerUserId);

    if (social != null) {
      Long userId = ((Number) social.get("user_id")).longValue();
      UserRow user = userMapper.findById(userId);

      if (user == null) {
        throw new BusinessException("연결된 사용자 정보를 찾을 수 없습니다.");
      }

      if (user.getStatus() != UserStatus.ACTIVE) {
        throw new BusinessException("사용할 수 없는 계정입니다.");
      }

      userMapper.updateLastLogin(user.getUserId());
      return user;
    }

    String email = extractEmail(provider, attributes);
    if (email == null || email.isBlank()) {
      throw new BusinessException("이메일 제공에 동의해야 합니다.");
    }

    // 동일 이메일 계정이 이미 존재하면 신규 생성하지 않고 소셜 계정만 연결
    if (userMapper.countByEmail(email) > 0) {
      UserRow existing = userMapper.findByEmail(email);
      if (existing == null) {
        throw new BusinessException("사용할 수 없는 계정입니다.");
      }

      try {
        userMapper.insertSocialAccount(
            existing.getUserId(),
            provider,
            providerUserId
        );
      } catch (DuplicateKeyException ignore) {
        // 이미 연결된 소셜 계정이면 그대로 로그인 처리
      }
      userMapper.updateLastLogin(existing.getUserId());
      return existing;
    }

    String name = extractName(provider, attributes);
    String tel  = extractTel(provider, attributes);

    UserRow user = new UserRow();
    user.setEmail(email);
    user.setPassword(passwordEncoder.encode("OAUTH-" + provider.toUpperCase() + "-" + UUID.randomUUID()));
    user.setName(name);
    user.setTel(tel);
    user.setRole(UserRole.USER);
    user.setProvider(provider);
    user.setStatus(UserStatus.ACTIVE);
    user.setEmailVerified(com.enfantTerrible.enfantTerrible.common.enums.EmailVerifiedStatus.Y);

    try {
      userMapper.insertOAuthUser(user);
    } catch (DuplicateKeyException e) {
      // 동시성/중복 가입 방어: 이미 이메일이 생성된 경우 소셜 계정만 연결
      UserRow existing = userMapper.findByEmail(email);
      if (existing == null) {
        throw e;
      }
      userMapper.insertSocialAccount(
          existing.getUserId(),
          provider,
          providerUserId
      );
      userMapper.updateLastLogin(existing.getUserId());
      return existing;
    }

    try {
      userMapper.insertSocialAccount(
          user.getUserId(),
          provider,
          providerUserId
      );
    } catch (DuplicateKeyException ignore) {
      // 이미 연결된 소셜 계정이면 그대로 로그인 처리
    }

    userMapper.updateLastLogin(user.getUserId());

    return user;
  }

  /**
   * Refresh Token으로 Access Token 재발급
   */
  public LoginResponse refresh(String refreshToken) {
    if (!jwtTokenProvider.validate(refreshToken)) {
      throw new BusinessException("유효하지 않은 리프레시 토큰입니다.");
    }

    String tokenType = jwtTokenProvider.getTokenType(refreshToken);
    if (!"REFRESH".equals(tokenType)) {
      throw new BusinessException("리프레시 토큰이 아닙니다.");
    }

    Long userId = jwtTokenProvider.getUserId(refreshToken);
    UserRow user = userMapper.findById(userId);
    if (user == null || user.getStatus() != UserStatus.ACTIVE) {
      throw new BusinessException("사용할 수 없는 계정입니다.");
    }

    String newAccessToken = jwtTokenProvider.createAccessToken(
        userId,
        user.getEmail(),
        user.getRole(),
        user.getStatus()
    );
    String newRefreshToken = jwtTokenProvider.createRefreshToken(userId);

    return new LoginResponse(newAccessToken, newRefreshToken);
  }

  // =====================
  // private helpers
  // =====================

  private String extractEmail(String provider, Map<String, Object> attributes) {
    // 각 OAuth2 제공사별 이메일 추출 로직
    switch (provider.toLowerCase()) {
      case "google":
        return (String) attributes.get("email");
      case "naver":
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");
        return (String) response.get("email");
      default:
        return null;
    }
  }

  private String extractName(String provider, Map<String, Object> attributes) {
    switch (provider.toLowerCase()) {
      case "google":
        return (String) attributes.get("name");
      case "naver":
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");
        return (String) response.get("name");
      default:
        return null;
    }
  }

  private String extractTel(String provider, Map<String, Object> attributes) {
    switch (provider.toLowerCase()) {
      case "google":
        return (String) attributes.get("phone_number");
      case "naver":
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");
        return (String) response.get("mobile");
      default:
        return null;
    }
  }
}
