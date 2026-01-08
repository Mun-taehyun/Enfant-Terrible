package com.enfantTerrible.enfantTerrible.service.auth;

import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    if (!"ACTIVE".equals(user.getStatus())) {
      throw new BusinessException("사용할 수 없는 계정입니다.");
    }

    userMapper.updateLastLogin(user.getUserId());

    String accessToken = jwtTokenProvider.createAccessToken(
        user.getUserId(),
        user.getRole()
    );

    return new LoginResponse(accessToken);
  }

  /**
   * OAuth 로그인
   */
  @Transactional
  public UserRow oauthLogin(
      String provider,
      String providerUserId,
      Map<String, Object> attributes
  ) {

    Map<String, Object> social =
        userMapper.findSocialAccount(provider, providerUserId);

    if (social != null) {
      Long userId = ((Number) social.get("user_id")).longValue();
      UserRow user = userMapper.findById(userId);

      if (user == null) {
        throw new BusinessException("연결된 사용자 정보를 찾을 수 없습니다.");
      }

      UserStatus status = UserStatus.from(user.getStatus());
      if (status != UserStatus.ACTIVE) {
        throw new BusinessException("사용할 수 없는 계정입니다.");
      }

      userMapper.updateLastLogin(user.getUserId());
      return user;
    }

    String email = extractEmail(provider, attributes);
    if (email == null || email.isBlank()) {
      throw new BusinessException("이메일 제공에 동의해야 합니다.");
    }

    String name = extractName(provider, attributes);
    String tel  = extractTel(provider, attributes);

    UserRow user = new UserRow();
    user.setEmail(email);
    user.setName(name);
    user.setTel(tel);
    user.setRole("USER");
    user.setProvider(provider);
    user.setStatus("ACTIVE");
    user.setEmailVerified("Y");

    userMapper.insertOAuthUser(user);

    userMapper.insertSocialAccount(
        user.getUserId(),
        provider,
        providerUserId
    );

    userMapper.updateLastLogin(user.getUserId());

    return user;
  }

  // ===== provider별 attribute 추출 =====

  @SuppressWarnings("unchecked")
  private String extractEmail(String provider, Map<String, Object> attributes) {
    if ("google".equals(provider)) {
      return String.valueOf(attributes.get("email"));
    }
    if ("naver".equals(provider)) {
      Map<String, Object> response =
          (Map<String, Object>) attributes.get("response");
      return response == null ? null : String.valueOf(response.get("email"));
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  private String extractName(String provider, Map<String, Object> attributes) {
    if ("google".equals(provider)) {
      return String.valueOf(attributes.get("name"));
    }
    if ("naver".equals(provider)) {
      Map<String, Object> response =
          (Map<String, Object>) attributes.get("response");
      return response == null ? null : String.valueOf(response.get("name"));
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  private String extractTel(String provider, Map<String, Object> attributes) {
    if ("naver".equals(provider)) {
      Map<String, Object> response =
          (Map<String, Object>) attributes.get("response");
      return response == null ? null : String.valueOf(response.get("mobile"));
    }
    return null;
  }
}
