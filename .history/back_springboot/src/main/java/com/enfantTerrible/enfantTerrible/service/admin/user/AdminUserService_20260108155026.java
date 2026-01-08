package com.enfantTerrible.enfantTerrible.service.admin.user;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.UserStatus;
import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.user.AdminUserDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.user.AdminUserListResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.user.AdminUserPetResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.user.AdminUserSearchRequest;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.admin.user.AdminUserMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminUserService {

  private final AdminUserMapper adminUserMapper;

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

  @Transactional(readOnly = true)
  public AdminUserDetailResponse getUserDetail(Long userId) {

    AdminUserDetailResponse user = adminUserMapper.findUserDetail(userId);
    if (user == null) {
      throw new BusinessException("존재하지 않는 사용자입니다.");
    }

    List<AdminUserPetResponse> pets = adminUserMapper.findUserPets(userId);
    user.setPets(pets);
    return user;
  }

  @Transactional
  public void updateUserStatus(Long userId, String status) {

    UserStatus userStatus = UserStatus.from(status);

    AdminUserDetailResponse user = adminUserMapper.findUserDetail(userId);
    if (user == null) {
      throw new BusinessException("존재하지 않는 사용자입니다.");
    }

    int updated =
      adminUserMapper.updateUserStatus(userId, userStatus.name());

    if (updated != 1) {
      throw new BusinessException("사용자 상태 변경에 실패했습니다.");
    }
  }

  // =====================
  // private helpers
  // =====================

  private void normalizePaging(AdminUserSearchRequest req) {
    if (req == null) {
      throw new BusinessException("요청 값이 비어있습니다.");
    }

    if (req.getPage() < 1) {
      req.setPage(1);
    }

    if (req.getSize() < 1) {
      req.setSize(20);
    } else if (req.getSize() > 200) {
      req.setSize(200);
    }
  }
}
