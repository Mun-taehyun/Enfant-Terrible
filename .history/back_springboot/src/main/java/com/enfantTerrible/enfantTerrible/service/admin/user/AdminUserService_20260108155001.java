package com.enfantTerrible.enfantTerrible.service.admin.user;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.user.AdminUserDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.user.AdminUserListResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.user.AdminUserPetResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.user.AdminUserSearchRequest;
import com.enfantTerrible.enfantTerrible.mapper.admin.user.AdminUserMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminUserService {

  private final AdminUserMapper adminUserMapper;

  /**
   * 관리자 - 사용자 목록 조회 (검색/필터/페이징)
   */
  @Transactional(readOnly = true)
  public AdminPageResponse<AdminUserListResponse> getUsers(AdminUserSearchRequest req) {
    normalizePaging(req);

    int total = adminUserMapper.countUsers(req);
    List<AdminUserListResponse> list = adminUserMapper.findUsers(req);

    return new AdminPageResponse<>(
      req.getPage(),
      req.getSize(),
      total,
      list
    );
  }

  /**
   * 관리자 - 사용자 상세 조회 (+ pets)
   */
  @Transactional(readOnly = true)
  public AdminUserDetailResponse getUserDetail(Long userId) {
    AdminUserDetailResponse user = adminUserMapper.findUserDetail(userId);
    if (user == null) {
      throw new IllegalArgumentException("존재하지 않는 사용자입니다.");
    }

    List<AdminUserPetResponse> pets = adminUserMapper.findUserPets(userId);
    user.setPets(pets);

    return user;
  }

  /**
   * 관리자 - 사용자 상태 변경
   */
  @Transactional
  public void updateUserStatus(Long userId, String status) {
    // status 값 검증: 프로젝트에서 허용하는 값만 통과
    validateStatus(status);

    // 존재 여부 체크 (deleted_at IS NULL 조건 포함된 상세 조회를 재사용)
    AdminUserDetailResponse user = adminUserMapper.findUserDetail(userId);
    if (user == null) {
      throw new IllegalArgumentException("존재하지 않는 사용자입니다.");
    }

    int updated = adminUserMapper.updateUserStatus(userId, status);
    if (updated != 1) {
      throw new IllegalStateException("사용자 상태 변경에 실패했습니다.");
    }
  }

  // =========================
  // private helpers
  // =========================

  private void normalizePaging(AdminUserSearchRequest req) {
    if (req == null) {
      throw new IllegalArgumentException("요청 값이 비어있습니다.");
    }

    // page: 1 이상
    if (req.getPage() < 1) {
      req.setPage(1);
    }

    // size: 1~200 정도로 제한 (관리자 API 안전장치)
    if (req.getSize() < 1) {
      req.setSize(20);
    } else if (req.getSize() > 200) {
      req.setSize(200);
    }

    // offset 계산이 getOffset()에 있다면 그대로 사용 가능
  }

  private void validateStatus(String status) {
    if (status == null || status.isBlank()) {
      throw new IllegalArgumentException("status는 필수입니다.");
    }

    if (!status.equals("ACTIVE") && !status.equals("SUSPENDED") && !status.equals("DELETED")) {
      throw new IllegalArgumentException("허용되지 않는 status 값입니다: " + status);
    }
  }
}
