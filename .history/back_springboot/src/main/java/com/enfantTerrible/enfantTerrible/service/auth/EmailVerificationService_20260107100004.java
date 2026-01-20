package com.enfantTerrible.enfantTerrible.service.auth;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.dto.auth.EmailVerificationRow;
import com.enfantTerrible.enfantTerrible.mapper.auth.EmailVerificationMapper;
import com.enfantTerrible.enfantTerrible.mapper.user.UserMapper;
import com.enfantTerrible.enfantTerrible.service.mail.MailService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class EmailVerificationService {

  private static final int EXPIRE_MINUTES = 10;

  private final EmailVerificationMapper emailVerificationMapper;
  private final UserMapper userMapper;
  private final MailService mailService;

  /**
   * 회원가입용 이메일 인증 요청
   */
  public void sendSignupVerification(String email) {

    // 1️⃣ 이미 가입된 이메일인지 체크
    if (userMapper.countByEmail(email) > 0) {
      throw new IllegalStateException("이미 사용 중인 이메일입니다.");
    }

    // 2️⃣ 기존 미인증 코드 무효화 (재발급 대비)
    emailVerificationMapper.invalidate(email, "signup");

    // 3️⃣ 인증 코드 생성
    String code = generateVerificationCode();

    // 4️⃣ 인증 정보 저장
    EmailVerificationRow row = new EmailVerificationRow();
    row.setEmail(email);
    row.setVerificationCode(code);
    row.setPurpose("signup");
    row.setExpiresAt(LocalDateTime.now().plusMinutes(EXPIRE_MINUTES));

    emailVerificationMapper.insert(row);

    // 5️⃣ 이메일 발송
    mailService.sendSignupVerification(email, code);
  }

  /**
   * 회원가입용 이메일 인증 확인
   */
  public void verifySignupEmail(String email, String code) {

    EmailVerificationRow row =
      emailVerificationMapper.findValid(email, code, "signup");

    if (row == null) {
      throw new IllegalStateException("유효하지 않거나 만료된 인증 코드입니다.");
    }

    emailVerificationMapper.markVerified(row.getEmailVerificationId());
  }

  /**
   * 회원가입 직전 인증 완료 여부 확인
   */
  @Transactional(readOnly = true)
  public boolean isSignupEmailVerified(String email) {
    return emailVerificationMapper.countVerified(email, "signup") > 0;
  }

  /**
   * 비밀번호 재설정용 이메일 인증 요청
   */
  public void sendPasswordResetVerification(String email) {

    // 가입된 사용자만 가능
    if (userMapper.countByEmail(email) == 0) {
      throw new IllegalStateException("존재하지 않는 이메일입니다.");
    }

    emailVerificationMapper.invalidate(email, "reset_password");

    String code = generateVerificationCode();

    EmailVerificationRow row = new EmailVerificationRow();
    row.setEmail(email);
    row.setVerificationCode(code);
    row.setPurpose("reset_password");
    row.setExpiresAt(LocalDateTime.now().plusMinutes(EXPIRE_MINUTES));

    emailVerificationMapper.insert(row);

    mailService.sendPasswordResetVerification(email, code);
  }

  /**
   * 비밀번호 재설정용 인증 코드 확인
   */
  public void verifyPasswordResetCode(String email, String code) {

    EmailVerificationRow row =
      emailVerificationMapper.findValid(email, code, "reset_password");

    if (row == null) {
      throw new IllegalStateException("유효하지 않거나 만료된 인증 코드입니다.");
    }

    emailVerificationMapper.markVerified(row.getEmailVerificationId());
  }

  /**
   * 비밀번호 재설정 가능 여부 확인
   */
  @Transactional(readOnly = true)
  public boolean isPasswordResetVerified(String email) {
    return emailVerificationMapper.countVerified(email, "reset_password") > 0;
  }

  /**
   * 인증 코드 생성 (6자리 숫자)
   */
  private String generateVerificationCode() {
    Random random = new Random();
    int code = 100000 + random.nextInt(900000);
    return String.valueOf(code);
  }
}
