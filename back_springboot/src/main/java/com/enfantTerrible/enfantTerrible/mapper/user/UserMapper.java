package com.enfantTerrible.enfantTerrible.mapper.user;

import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.user.UserRow;


@Mapper
public interface UserMapper {

  /**
   * 로그인용 조회 (ACTIVE + 미삭제)
   */
  UserRow findByEmail(@Param("email") String email);

  /**
   * 단일 회원 조회 (미삭제)
   */
  UserRow findById(@Param("userId") Long userId);

  /**
   * 회원가입
   * - useGeneratedKeys 로 userId 자동 세팅
   */
  int insert(UserRow row);

  /**
   * 이메일 중복 체크
   */
  int countByEmail(@Param("email") String email);

  /**
   * 이메일 인증 완료 처리
   */
  int verifyEmail(@Param("userId") Long userId);

  /**
   * 회원정보 수정
   */
  int updateProfile(UserRow row);

  /**
   * 비밀번호 변경
   */
  int updatePassword(
    @Param("userId") Long userId,
    @Param("password") String password
  );

  /**
   * 비밀번호 변경일시 업데이트
   */
  int updatePasswordWithTimestamp(
    @Param("userId") Long userId,
    @Param("password") String password
  );

  /**
   * 마지막 로그인 시간 갱신
   */
  int updateLastLogin(@Param("userId") Long userId);

  /**
   * 회원 탈퇴 (소프트 딜리트)
   */
  int softDelete(@Param("userId") Long userId);

  // =========================
  // OAuth 전용
  // =========================

  /**
   * 소셜 계정 조회
   */
  Map<String, Object> findSocialAccount(
    @Param("provider") String provider,
    @Param("providerUserId") String providerUserId
  );

  /**
   * 소셜 계정 생성
   */
  int insertSocialAccount(
    @Param("userId") Long userId,
    @Param("provider") String provider,
    @Param("providerUserId") String providerUserId
  );

  /**
   * OAuth 신규 회원 생성
   */
  int insertOAuthUser(UserRow row);

  /**
   * userId 기준 회원 조회 (OAuth용)
   */
  UserRow findByUserId(@Param("userId") Long userId);
}
