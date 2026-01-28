package com.enfantTerrible.enfantTerrible.mapper.auth;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.auth.EmailVerificationRow;

@Mapper
public interface EmailVerificationMapper {

  /**
   * 이메일 인증 요청 저장
   */
  int insert(EmailVerificationRow row);

  /**
   * 재발급 대비
   * - 기존 미인증 + 미만료 인증 건 무효화
   */
  int invalidate(
    @Param("email") String email,
    @Param("purpose") String purpose
  );

  /**
   * 유효한 인증 코드 조회
   * - 미인증
   * - 미만료
   */
  EmailVerificationRow findValid(
    @Param("email") String email,
    @Param("verificationCode") String verificationCode,
    @Param("purpose") String purpose
  );

  /**
   * 인증 완료 처리
   */
  int markVerified(
    @Param("emailVerificationId") Long emailVerificationId
  );

  /**
   * 회원가입 직전 인증 완료 여부 확인
   */
  int countVerified(
    @Param("email") String email,
    @Param("purpose") String purpose
  );
}
