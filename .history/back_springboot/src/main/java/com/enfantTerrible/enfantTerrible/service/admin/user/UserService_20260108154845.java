package com.enfantTerrible.enfantTerrible.service.admin.user;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.EmailVerifiedStatus;
import com.enfantTerrible.enfantTerrible.common.enums.UserRole;
import com.enfantTerrible.enfantTerrible.common.enums.UserStatus;
import com.enfantTerrible.enfantTerrible.dto.user.ChangePasswordRequest;
import com.enfantTerrible.enfantTerrible.dto.user.CompleteProfileRequest;
import com.enfantTerrible.enfantTerrible.dto.user.ResetPasswordRequest;
import com.enfantTerrible.enfantTerrible.dto.user.SignupRequest;
import com.enfantTerrible.enfantTerrible.dto.user.UpdateProfileRequest;
import com.enfantTerrible.enfantTerrible.dto.user.UserResponse;
import com.enfantTerrible.enfantTerrible.dto.user.UserRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
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
      throw new BusinessException("이메일 인증이 필요합니다.");
    }

    UserRow row = new UserRow();
    row.setEmail(req.getEmail());
    row.setPassword(passwordEncoder.encode(req.getPassword()));
    row.setName(req.getName());
    row.setTel(req.getTel());
    row.setZipCode(req.getZipCode());
    row.setAddressBase(req.getAddressBase());
    row.setAddressDetail(req.getAddressDetail());

    row.setRole(UserRole.USER.name());
    row.setProvider("local");
    row.setStatus(UserStatus.ACTIVE.name());
    row.setEmailVerified(EmailVerifiedStatus.Y.name());

    userMapper.insert(row);
    return toResponse(row);
  }

  public void completeProfile(Long userId, CompleteProfileRequest req) {
    UserRow user = getUserOrThrow(userId);

    user.setTel(req.getTel());
    user.setZipCode(req.getZipCode());
    user.setAddressBase(req.getAddressBase());
    user.setAddressDetail(req.getAddressDetail());

    userMapper.updateProfile(user);
  }

  @Transactional(readOnly = true)
  public UserResponse getMyInfo(Long userId) {
    return toResponse(getUserOrThrow(userId));
  }

  /**
   * Security 전용 조회
   */
  @Transactional(readOnly = true)
  public UserRow getUserForSecurity(Long userId) {
    return getUserOrThrow(userId);
  }

  public UserResponse updateProfile(Long userId, UpdateProfileRequest req) {

    UserRow row = getUserOrThrow(userId);

    row.setName(req.getName());
    row.setTel(req.getTel());
    row.setZipCode(req.getZipCode());
    row.setAddressBase(req.getAddressBase());
    row.setAddressDetail(req.getAddressDetail());

    userMapper.updateProfile(row);
    return toResponse(getUserOrThrow(userId));
  }

  public void changePassword(Long userId, ChangePasswordRequest req) {

    UserRow row = getUserOrThrow(userId);

    if (!passwordEncoder.matches(req.getCurrentPassword(), row.getPassword())) {
      throw new BusinessException("현재 비밀번호가 일치하지 않습니다.");
    }

    userMapper.updatePassword(
      userId,
      passwordEncoder.encode(req.getNewPassword())
    );
  }

  public void resetPassword(ResetPasswordRequest req) {

    if (!emailVerificationService.isPasswordResetVerified(req.getEmail())) {
      throw new BusinessException("이메일 인증이 필요합니다.");
    }

    UserRow row = userMapper.findByEmail(req.getEmail());
    if (row == null) {
      throw new BusinessException("존재하지 않는 사용자입니다.");
    }

    userMapper.updatePassword(
      row.getUserId(),
      passwordEncoder.encode(req.getNewPassword())
    );
  }

  public void updateLastLogin(Long userId) {
    userMapper.updateLastLogin(userId);
  }

  public void delete(Long userId) {
    getUserOrThrow(userId);
    userMapper.softDelete(userId);
  }

  // =====================
  // private helpers
  // =====================

  private UserRow getUserOrThrow(Long userId) {
    UserRow row = userMapper.findById(userId);
    if (row == null) {
      throw new BusinessException("존재하지 않는 사용자입니다.");
    }
    return row;
  }

  private UserResponse toResponse(UserRow row) {
    return new UserResponse(
      row.getUserId(),
      row.getEmail(),
      row.getName(),
      row.getTel(),
      row.getZipCode(),
      row.getAddressBase(),
      row.getAddressDetail(),
      row.getRole(),
      row.getStatus()
    );
  }
}
