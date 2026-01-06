package com.enfantTerrible.enfantTerrible.service.auth;

import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.dto.auth.LoginRequest;
import com.enfantTerrible.enfantTerrible.dto.auth.LoginResponse;
import com.enfantTerrible.enfantTerrible.dto.user.UserResponse;
import com.enfantTerrible.enfantTerrible.dto.user.UserRow;
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

    // 이메일로 사용자 조회 (ACTIVE + 미삭제)
    UserRow user = userMapper.findByEmail(req.getEmail());

    if (user == null) {
      throw new IllegalStateException("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    // 비밀번호 검증
    if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
      throw new IllegalStateException("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    // 상태 체크 (방어적)
    if (!"ACTIVE".equals(user.getStatus())) {
      throw new IllegalStateException("사용할 수 없는 계정입니다.");
    }

    // 마지막 로그인 시간 갱신
    userMapper.updateLastLogin(user.getUserId());

    // JWT 발급
    String accessToken = jwtTokenProvider.createAccessToken(
      user.getUserId(),
      user.getRole()
    );

    return new LoginResponse(
      accessToken,
      UserResponse.from(user)
    );
  }

  /**
   * OAuth 로그인
   * - social_account 기준 조회
   * - 없으면 et_user + et_social_account 생성
   */
  @Transactional
  public UserRow oauthLogin(
    String provider,
    String providerUserId,
    Map<String, Object> attributes
  ) {

    // 1️⃣ 소셜 계정 조회
    Map<String, Object> social =
      userMapper.findSocialAccount(provider, providerUserId);

    if (social != null) {
      Long userId = ((Number) social.get("user_id")).longValue();
      UserRow user = userMapper.findById(userId);

      if (user == null) {
        throw new IllegalStateException("연결된 사용자 정보를 찾을 수 없습니다.");
      }

      // 상태 체크
      if (!"ACTIVE".equals(user.getStatus())) {
        throw new IllegalStateException("사용할 수 없는 계정입니다.");
      }

      // 마지막 로그인 시간 갱신
      userMapper.updateLastLogin(user.getUserId());

      return user;
    }

    // 2️⃣ 신규 OAuth 사용자 생성 전 필수 정보 추출
    String email = extractEmail(provider, attributes);
    if (email == null || email.isBlank()) {
      throw new IllegalStateException("이메일 제공에 동의해야 합니다.");
    }

    String name = extractName(provider, attributes);
    String tel  = extractTel(provider, attributes); // provider 가능 시만

    // 3️⃣ 신규 OAuth 사용자 생성
    UserRow user = new UserRow();
    user.setEmail(email);
    user.setName(name);
    user.setTel(tel);              // 없으면 null
    user.setRole("USER");
    user.setProvider(provider);
    user.setStatus("ACTIVE");
    user.setEmailVerified("Y");

    userMapper.insertOAuthUser(user);

    // 4️⃣ 소셜 계정 연결
    userMapper.insertSocialAccount(
      user.getUserId(),
      provider,
      providerUserId
    );

    // 5️⃣ 마지막 로그인 시간 갱신
    userMapper.updateLastLogin(user.getUserId());

    return user;
  }

  /**
   * OAuth provider별 email 추출
   */
  @SuppressWarnings("unchecked")
  private String extractEmail(
    String provider,
    Map<String, Object> attributes
  ) {

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

  /**
   * OAuth provider별 name 추출
   */
  @SuppressWarnings("unchecked")
  private String extractName(
    String provider,
    Map<String, Object> attributes
  ) {

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

  /**
   * OAuth provider별 전화번호 추출 (가능한 provider만)
   */
  @SuppressWarnings("unchecked")
  private String extractTel(
    String provider,
    Map<String, Object> attributes
  ) {

    if ("naver".equals(provider)) {
      Map<String, Object> response =
        (Map<String, Object>) attributes.get("response");
      return response == null ? null : String.valueOf(response.get("mobile"));
    }

    // google 기본 OAuth에서는 제공 안 함
    return null;
  }
}
