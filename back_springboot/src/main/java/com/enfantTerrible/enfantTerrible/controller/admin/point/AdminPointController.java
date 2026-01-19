package com.enfantTerrible.enfantTerrible.controller.admin.point;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.point.AdminPointAdjustRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.point.AdminPointBalanceResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.point.AdminPointHistoryRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.point.AdminPointHistoryResponse;
import com.enfantTerrible.enfantTerrible.service.admin.point.AdminPointService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/points")
public class AdminPointController {

  private final AdminPointService adminPointService;

  @GetMapping("/users/{userId}/balance")
  public ApiResponse<AdminPointBalanceResponse> balance(
      @PathVariable Long userId
  ) {
    return ApiResponse.success(
        adminPointService.getUserBalance(userId),
        "관리자 포인트 잔액 조회 성공"
    );
  }

  @GetMapping("/users/{userId}/history")
  public ApiResponse<AdminPageResponse<AdminPointHistoryResponse>> history(
      @PathVariable Long userId,
      AdminPointHistoryRequest req
  ) {
    return ApiResponse.success(
        adminPointService.getUserHistory(userId, req),
        "관리자 포인트 히스토리 조회 성공"
    );
  }

  @PostMapping("/users/{userId}/adjust")
  public ApiResponse<Void> adjust(
      @PathVariable Long userId,
      @Valid @RequestBody AdminPointAdjustRequest req
  ) {
    adminPointService.adjust(userId, req);
    return ApiResponse.successMessage("관리자 포인트 조정 완료");
  }
}
