package com.enfantTerrible.enfantTerrible.controller.admin.qna;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.qna.AdminQnaRoomListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.qna.AdminQnaRoomListResponse;
import com.enfantTerrible.enfantTerrible.dto.qna.QnaMessageResponse;
import com.enfantTerrible.enfantTerrible.service.admin.qna.AdminQnaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/qna")
public class AdminQnaController {

  private final AdminQnaService adminQnaService;

  @GetMapping("/rooms")
  public ApiResponse<AdminPageResponse<AdminQnaRoomListResponse>> rooms(
      AdminQnaRoomListRequest req
  ) {
    return ApiResponse.success(
        adminQnaService.getRooms(req),
        "관리자 QnA 방 목록 조회 성공"
    );
  }

  @GetMapping("/messages")
  public ApiResponse<java.util.List<QnaMessageResponse>> messages(
      @RequestParam Long roomId,
      @RequestParam(required = false, defaultValue = "50") int limit
  ) {
    return ApiResponse.success(
        adminQnaService.getRecentMessages(roomId, limit),
        "관리자 QnA 메시지 조회 성공"
    );
  }
}
