package com.enfantTerrible.enfantTerrible.controller.admin.banner;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.banner.AdminBannerDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.banner.AdminBannerListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.banner.AdminBannerListResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.banner.AdminBannerSaveRequest;
import com.enfantTerrible.enfantTerrible.service.admin.banner.AdminBannerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/banners")
public class AdminBannerController {

  private final AdminBannerService adminBannerService;

  @GetMapping
  public ApiResponse<AdminPageResponse<AdminBannerListResponse>> list(
      AdminBannerListRequest req
  ) {
    return ApiResponse.success(
        adminBannerService.getBanners(req),
        "관리자 배너 목록 조회 성공"
    );
  }

  @GetMapping("/{bannerId}")
  public ApiResponse<AdminBannerDetailResponse> detail(
      @PathVariable Long bannerId
  ) {
    return ApiResponse.success(
        adminBannerService.getBanner(bannerId),
        "관리자 배너 상세 조회 성공"
    );
  }

  @PostMapping
  public ApiResponse<Long> create(
      @Valid @RequestBody AdminBannerSaveRequest req
  ) {
    return ApiResponse.success(
        adminBannerService.create(req),
        "배너 생성 성공"
    );
  }

  @PutMapping("/{bannerId}")
  public ApiResponse<Void> update(
      @PathVariable Long bannerId,
      @Valid @RequestBody AdminBannerSaveRequest req
  ) {
    adminBannerService.update(bannerId, req);
    return ApiResponse.successMessage("배너 수정 성공");
  }

  @DeleteMapping("/{bannerId}")
  public ApiResponse<Void> delete(
      @PathVariable Long bannerId
  ) {
    adminBannerService.delete(bannerId);
    return ApiResponse.successMessage("배너 삭제 성공");
  }
}
