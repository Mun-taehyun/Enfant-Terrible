package com.enfantTerrible.enfantTerrible.controller.admin.user;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.user.AdminUserDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.user.AdminUserListResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.user.AdminUserSearchRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.user.AdminUserStatusUpdateRequest;
import com.enfantTerrible.enfantTerrible.service.admin.user.AdminUserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
public class AdminUserController {

  private final AdminUserService adminUserService;

  /**
   * 관리자 - 사용자 목록 조회
   * GET /api/admin/users
   *
   * - 검색 조건이 모두 없으면 전체 조회
   * - 항상 페이징 적용
   */
  @GetMapping
  public AdminPageResponse<AdminUserListResponse> getUsers(
    AdminUserSearchRequest req
  ) {
    return adminUserService.getUsers(req);
  }

  /**
   * 관리자 - 사용자 상세 조회
   * GET /api/admin/users/{userId}
   */
  @GetMapping("/{userId}")
  public AdminUserDetailResponse getUserDetail(
    @PathVariable Long userId
  ) {
    return adminUserService.getUserDetail(userId);
  }

  /**
   * 관리자 - 사용자 상태 변경
   * PATCH /api/admin/users/{userId}/status
   */
  @PatchMapping("/{userId}/status")
  public ResponseEntity<Void> updateUserStatus(
    @PathVariable Long userId,
    @Valid @RequestBody AdminUserStatusUpdateRequest req
  ) {
    adminUserService.updateUserStatus(userId, req.getStatus());
    return ResponseEntity.noContent().build();
  }
}
