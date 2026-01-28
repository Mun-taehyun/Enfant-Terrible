package com.enfantTerrible.enfantTerrible.controller.admin.user;

import org.springframework.web.bind.annotation.*;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.user.AdminUserDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.user.AdminUserListResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.user.AdminUserSearchRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.user.AdminUserStatusUpdateRequest;
import com.enfantTerrible.enfantTerrible.service.admin.user.AdminUserService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
public class AdminUserController {

  private final AdminUserService adminUserService;

  /**
   * 관리자 - 사용자 목록 조회
   */
  @GetMapping
  public ApiResponse<AdminPageResponse<AdminUserListResponse>> getUsers(
    AdminUserSearchRequest req
  ) {
    return ApiResponse.success(
      adminUserService.getUsers(req),
      "사용자 목록 조회 성공"
    );
  }

  /**
   * 관리자 - 사용자 상세 조회
   */
  @GetMapping("/{userId}")
  public ApiResponse<AdminUserDetailResponse> getUserDetail(
    @PathVariable Long userId
  ) {
    return ApiResponse.success(
      adminUserService.getUserDetail(userId),
      "사용자 상세 조회 성공"
    );
  }

  /**
   * 관리자 - 사용자 상태 변경
   */
  @PatchMapping("/{userId}/status")
  public ApiResponse<Void> updateUserStatus(
    @PathVariable Long userId,
    @RequestBody AdminUserStatusUpdateRequest req
  ) {
    adminUserService.updateUserStatus(userId, req.getStatus());
    return ApiResponse.successMessage("사용자 상태 변경 완료");
  }
}
