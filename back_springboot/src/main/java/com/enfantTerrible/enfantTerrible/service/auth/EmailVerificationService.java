package com.enfantTerrible.enfantTerrible.service.auth;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.EmailVerificationPurpose;
import com.enfantTerrible.enfantTerrible.dto.auth.EmailVerificationRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.auth.EmailVerificationMapper;
import com.enfantTerrible.enfantTerrible.mapper.user.UserMapper;
import com.enfantTerrible.enfantTerrible.service.mail.MailService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class EmailVerificationService {

  private static final int EXPIRE_MINUTES = 10;
  private static final int MAX_ATTEMPTS_PER_HOUR = 5;
  
  // Rate Limiting을 위한 메모리 저장소 (실제 운영에서는 Redis 사용 권장)
  private final ConcurrentHashMap<String, Long> attemptCache = new ConcurrentHashMap<>();

  private final EmailVerificationMapper emailVerificationMapper;
  private final UserMapper userMapper;
  private final MailService mailService;
  private final SecureRandom secureRandom = new SecureRandom();

  /**
   * 회원가입용 이메일 인증 요청
   */
  public void sendSignupVerification(String email) {

    // Rate Limiting 체크
    checkRateLimit(email);

    // 1️⃣ 이미 가입된 이메일인지 체크
    if (userMapper.countByEmail(email) > 0) {
      throw new BusinessException("이미 사용 중인 이메일입니다.");
    }

    // 2️⃣ 기존 미인증 코드 무효화 (재발급 대비)
    emailVerificationMapper.invalidate(email, EmailVerificationPurpose.SIGNUP.getCode());

    // 3️⃣ 인증 코드 생성
    String code = generateSecureVerificationCode();

    // 4️⃣ 인증 정보 저장
    EmailVerificationRow row = new EmailVerificationRow();
    row.setEmail(email);
    row.setVerificationCode(code);
    row.setPurpose(EmailVerificationPurpose.SIGNUP);
    row.setExpiresAt(LocalDateTime.now().plusMinutes(EXPIRE_MINUTES));

    emailVerificationMapper.insert(row);

    // 5️⃣ 비동기 이메일 발송
    sendSignupVerificationAsync(email, code);
  }

  /**
   * 회원가입용 이메일 인증 확인
   */
  public void verifySignupEmail(String email, String code) {

    EmailVerificationRow row =
      emailVerificationMapper.findValid(email, code, EmailVerificationPurpose.SIGNUP.getCode());

    if (row == null) {
      throw new BusinessException("유효하지 않거나 만료된 인증 코드입니다.");
    }

    emailVerificationMapper.markVerified(row.getEmailVerificationId());
  }

  /**
   * 회원가입 직전 인증 완료 여부 확인
   */
  @Transactional(readOnly = true)
  public boolean isSignupEmailVerified(String email) {
    return emailVerificationMapper.countVerified(email, EmailVerificationPurpose.SIGNUP.getCode()) > 0;
  }

  /**
   * 비밀번호 재설정용 이메일 인증 요청
   */
  public void sendPasswordResetVerification(String email) {

    // Rate Limiting 체크
    checkRateLimit(email);

    // 가입된 사용자만 가능
    if (userMapper.countByEmail(email) == 0) {
      throw new BusinessException("존재하지 않는 이메일입니다.");
    }

    // 기존 코드 무효화
    emailVerificationMapper.invalidate(email, EmailVerificationPurpose.PASSWORD_RESET.getCode());

    String code = generateSecureVerificationCode();

    EmailVerificationRow row = new EmailVerificationRow();
    row.setEmail(email);
    row.setVerificationCode(code);
    row.setPurpose(EmailVerificationPurpose.PASSWORD_RESET);
    row.setExpiresAt(LocalDateTime.now().plusMinutes(EXPIRE_MINUTES));

    emailVerificationMapper.insert(row);

    // 비동기 이메일 발송
    sendPasswordResetVerificationAsync(email, code);
  }

  /**
   * 비밀번호 재설정용 인증 코드 확인
   */
  public void verifyPasswordResetCode(String email, String code) {

    EmailVerificationRow row =
      emailVerificationMapper.findValid(email, code, EmailVerificationPurpose.PASSWORD_RESET.getCode());

    if (row == null) {
      throw new BusinessException("유효하지 않거나 만료된 인증 코드입니다.");
    }

    emailVerificationMapper.markVerified(row.getEmailVerificationId());
  }

  /**
   * 비밀번호 재설정 가능 여부 확인
   */
  @Transactional(readOnly = true)
  public boolean isPasswordResetVerified(String email) {
    return emailVerificationMapper.countVerified(email, EmailVerificationPurpose.PASSWORD_RESET.getCode()) > 0;
  }

  /**
   * Rate Limiting 체크 (시간당 최대 요청 횟수 제한)
   */
  private void checkRateLimit(String email) {
    String key = email + ":" + System.currentTimeMillis() / (60 * 60 * 1000); // 시간별 키
    
    Long attempts = attemptCache.getOrDefault(key, 0L);
    if (attempts >= MAX_ATTEMPTS_PER_HOUR) {
      throw new BusinessException("시간당 최대 요청 횟수를 초과했습니다. 1시간 후 다시 시도해주세요.");
    }
    
    attemptCache.put(key, attempts + 1);
    
    // 1시간 후 만료된 항목 정리 (간단한 구현)
    attemptCache.entrySet().removeIf(entry -> 
        System.currentTimeMillis() - entry.getKey().hashCode() > TimeUnit.HOURS.toMillis(1));
  }

  /**
   * 보안 강화된 인증 코드 생성 (SecureRandom 사용)
   */
  private String generateSecureVerificationCode() {
    int code = 100000 + secureRandom.nextInt(900000);
    return String.valueOf(code);
  }

  /**
   * 비동기 회원가입 인증 이메일 발송
   */
  @Async("emailTaskExecutor")
  private void sendSignupVerificationAsync(String email, String code) {
    mailService.sendSignupVerification(email, code);
  }

  /**
   * 비동기 비밀번호 재설정 인증 이메일 발송
   */
  @Async("emailTaskExecutor")
  private void sendPasswordResetVerificationAsync(String email, String code) {
    mailService.sendPasswordResetVerification(email, code);
  }
}
