package com.enfantTerrible.enfantTerrible.controller.popup;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.popup.PopupResponse;
import com.enfantTerrible.enfantTerrible.service.popup.PopupService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/popups")
public class PopupController {

  private final PopupService popupService;

  @GetMapping
  public ApiResponse<List<PopupResponse>> list() {
    return ApiResponse.success(
        popupService.getActivePopups(),
        "팝업 목록 조회 성공"
    );
  }
}
