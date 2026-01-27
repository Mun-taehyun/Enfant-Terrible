package com.enfantTerrible.enfantTerrible.mapper.admin.user;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.admin.user.AdminUserDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.user.AdminUserListResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.user.AdminUserPetResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.user.AdminUserSearchRequest;

@Mapper
public interface AdminUserMapper {

  /**
   * 관리자 - 사용자 목록 조회 (검색 + 페이징)
   */
  List<AdminUserListResponse> findUsers(
    @Param("req") AdminUserSearchRequest req
  );

  /**
   * 관리자 - 사용자 전체 수 (검색 조건 동일)
   */
  int countUsers(
    @Param("req") AdminUserSearchRequest req
  );

  /**
   * 관리자 - 사용자 상세 조회
   */
  AdminUserDetailResponse findUserDetail(
    @Param("userId") Long userId
  );

  /**
   * 관리자 - 사용자 펫 정보 조회
   */
  List<AdminUserPetResponse> findUserPets(
    @Param("userId") Long userId
  );

  /**
   * 관리자 - 사용자 상태 변경
   */
  int updateUserStatus(
    @Param("userId") Long userId,
    @Param("status") String status
  );
}
