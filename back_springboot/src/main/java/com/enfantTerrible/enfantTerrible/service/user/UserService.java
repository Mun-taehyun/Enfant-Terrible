package com.enfantTerrible.enfantTerrible.service.user;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.dto.user.ChangePasswordRequest;
import com.enfantTerrible.enfantTerrible.dto.user.CompleteProfileRequest;
import com.enfantTerrible.enfantTerrible.dto.user.ResetPasswordRequest;
import com.enfantTerrible.enfantTerrible.dto.user.SignupRequest;
import com.enfantTerrible.enfantTerrible.dto.user.UpdateProfileRequest;
import com.enfantTerrible.enfantTerrible.dto.user.UserResponse;
import com.enfantTerrible.enfantTerrible.dto.user.UserRow;
import com.enfantTerrible.enfantTerrible.mapper.user.UserMapper;
import com.enfantTerrible.enfantTerrible.service.auth.EmailVerificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

  private final UserMapper userMapper;
  private final PasswordEncoder passwordEncoder;
  private final EmailVerificationService emailVerificationService;

  /**
   * 회원가입 (LOCAL)
   */
  public UserResponse signup(SignupRequest req) {

    if (!emailVerificationService.isSignupEmailVerified(req.getEmail())) {
      throw new IllegalStateException("이메일 인증이 필요합니다.");
    }

    UserRow row = new UserRow();
    row.setEmail(req.getEmail());
    row.setPassword(passwordEncoder.encode(req.getPassword()));
    row.setName(req.getName());
    row.setTel(req.getTel());
    row.setZipCode(req.getZipCode());
    row.setAddressBase(req.getAddressBase());
    row.setAddressDetail(req.getAddressDetail());

    // 기본값
    row.setRole("USER");
    row.setProvider("local");
    row.setStatus("ACTIVE");
    row.setEmailVerified("Y");

    userMapper.insert(row);

    return UserResponse.from(row);
  }

  public void completeProfile(Long userId, CompleteProfileRequest req) {
    UserRow user = userMapper.findById(userId);
    if (user == null) {
      throw new IllegalStateException("존재하지 않는 사용자입니다.");
    }

    user.setTel(req.getTel());
    user.setZipCode(req.getZipCode());
    user.setAddressBase(req.getAddressBase());
    user.setAddressDetail(req.getAddressDetail());

    userMapper.updateProfile(user);
  }

  /**
   * 내 정보 조회
   */
  @Transactional(readOnly = true)
  public UserResponse getMyInfo(Long userId) {
    UserRow row = userMapper.findById(userId);
    if (row == null) {
      throw new IllegalStateException("존재하지 않는 사용자입니다.");
    }
    return UserResponse.from(row);
  }

  /**
   * Security 전용 조회
   * - JWT 인증 시 필요한 필드 포함
   * - Controller 노출 금지
   */
  @Transactional(readOnly = true)
  public UserRow getUserForSecurity(Long userId) {
    UserRow row = userMapper.findById(userId);
    if (row == null) {
      throw new IllegalStateException("존재하지 않는 사용자입니다.");
    }
    return row;
  }

  /**
   * 회원정보 수정
   */
  public UserResponse updateProfile(Long userId, UpdateProfileRequest req) {

    UserRow row = new UserRow();
    row.setUserId(userId);
    row.setName(req.getName());
    row.setTel(req.getTel());
    row.setZipCode(req.getZipCode());
    row.setAddressBase(req.getAddressBase());
    row.setAddressDetail(req.getAddressDetail());

    userMapper.updateProfile(row);

    UserRow updated = userMapper.findById(userId);
    return UserResponse.from(updated);
  }

  /**
   * 내 정보 → 비밀번호 변경
   */
  public void changePassword(Long userId, ChangePasswordRequest req) {

    UserRow row = userMapper.findById(userId);
    if (row == null) {
      throw new IllegalStateException("존재하지 않는 사용자입니다.");
    }

    if (!passwordEncoder.matches(req.getCurrentPassword(), row.getPassword())) {
      throw new IllegalStateException("현재 비밀번호가 일치하지 않습니다.");
    }

    userMapper.updatePassword(
      userId,
      passwordEncoder.encode(req.getNewPassword())
    );
  }

  /**
   * 비밀번호 찾기 → 이메일 인증 후 비밀번호 재설정
   */
  public void resetPassword(ResetPasswordRequest req) {

    UserRow row = userMapper.findByEmail(req.getEmail());
    if (row == null) {
      throw new IllegalStateException("존재하지 않는 사용자입니다.");
    }

    userMapper.updatePassword(
      row.getUserId(),
      passwordEncoder.encode(req.getNewPassword())
    );
  }

  /**
   * 마지막 로그인 시간 갱신
   */
  public void updateLastLogin(Long userId) {
    userMapper.updateLastLogin(userId);
  }

  /**
   * 회원 탈퇴 (소프트 딜리트)
   */
  public void delete(Long userId) {
    userMapper.softDelete(userId);
  }
}
