package com.enfantTerrible.enfantTerrible.controller.admin.popup;

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
import com.enfantTerrible.enfantTerrible.dto.admin.popup.AdminPopupDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.popup.AdminPopupListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.popup.AdminPopupListResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.popup.AdminPopupSaveRequest;
import com.enfantTerrible.enfantTerrible.service.admin.popup.AdminPopupService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/popups")
public class AdminPopupController {

  private final AdminPopupService adminPopupService;

  @GetMapping
  public ApiResponse<AdminPageResponse<AdminPopupListResponse>> list(
      AdminPopupListRequest req
  ) {
    return ApiResponse.success(
        adminPopupService.getPopups(req),
        "관리자 팝업 목록 조회 성공"
    );
  }

  @GetMapping("/{popupId}")
  public ApiResponse<AdminPopupDetailResponse> detail(
      @PathVariable Long popupId
  ) {
    return ApiResponse.success(
        adminPopupService.getPopup(popupId),
        "관리자 팝업 상세 조회 성공"
    );
  }

  @PostMapping
  public ApiResponse<Long> create(
      @Valid @RequestBody AdminPopupSaveRequest req
  ) {
    return ApiResponse.success(
        adminPopupService.create(req),
        "팝업 생성 성공"
    );
  }

  @PutMapping("/{popupId}")
  public ApiResponse<Void> update(
      @PathVariable Long popupId,
      @Valid @RequestBody AdminPopupSaveRequest req
  ) {
    adminPopupService.update(popupId, req);
    return ApiResponse.successMessage("팝업 수정 성공");
  }

  @DeleteMapping("/{popupId}")
  public ApiResponse<Void> delete(
      @PathVariable Long popupId
  ) {
    adminPopupService.delete(popupId);
    return ApiResponse.successMessage("팝업 삭제 성공");
  }
}
