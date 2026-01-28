package com.enfantTerrible.enfantTerrible.controller.point;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.point.PointBalanceResponse;
import com.enfantTerrible.enfantTerrible.dto.point.PointChangeRequest;
import com.enfantTerrible.enfantTerrible.dto.point.PointHistoryResponse;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.service.point.PointService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/points")
public class PointController {

  private final PointService pointService;

  @GetMapping("/me")
  public ApiResponse<PointBalanceResponse> me(
      @AuthenticationPrincipal CustomUserPrincipal principal
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    return ApiResponse.success(
        pointService.getMyBalance(principal.getUserId()),
        "포인트 조회 성공"
    );
  }

  @GetMapping("/me/history")
  public ApiResponse<List<PointHistoryResponse>> myHistory(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    return ApiResponse.success(
        pointService.getMyHistory(principal.getUserId(), page, size),
        "포인트 히스토리 조회 성공"
    );
  }

  @PostMapping("/me/earn")
  public ApiResponse<Void> earn(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @RequestBody PointChangeRequest req
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    pointService.earn(principal.getUserId(), req);
    return ApiResponse.successMessage("포인트 적립 성공");
  }

  @PostMapping("/me/use")
  public ApiResponse<Void> use(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @RequestBody PointChangeRequest req
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    pointService.use(principal.getUserId(), req);
    return ApiResponse.successMessage("포인트 사용 성공");
  }
}
